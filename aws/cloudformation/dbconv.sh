#!/bin/bash

# Original from: s3://datapipeline-us-east-1/sample-scripts/dbconv.sh

#Example Invocation
#./dbconv.sh \
#  --rds_jdbc=jdbc:mysql://dbtest.cob91vaba6fq.us-east-1.rds.amazonaws.com:3306/sakila \
#  --rds_usr=admin \
#  --rds_pwd=testpassword \
#  --rds_tbl=customer \
#  --red_jdbc=jdbc:postgresql://eudb3.cvprvckckqrm.eu-west-1.redshift.amazonaws.com:5439/dbtest?tcpKeepAlive=true \
#  --red_usr=admin \
#  --red_pwd=test123E \
#  --red_tbl=RedTub \
#  --red_dist=customer_id \
#  --red_sort=create_date \
#  --red_ins=OVERWRITE_EXISTING \
#  --rds_cols=id,created_at,updated_at

echo "Number of arguments: $#"
#echo "Arguments: $@"

for i in "$@"
do
case "$i" in
    --rds_jdbc=*|-a=*)
    RDSJdbc="${i#*=}"
    shift
    ;;
    -b=*|--rds_usr=*)
    RDSUsr="${i#*=}"
    shift
    ;;
    -c=*|--rds_pwd=*)
    RDSPwd="${i#*=}"
    shift
    ;;
    -d=*|--rds_tbl=*)
    RDSTbl="${i#*=}"
    shift
    ;;
    -e=*|--red_jdbc=*)
    REDJdbc="${i#*=}"
    shift
    ;;
    -f=*|--red_usr=*)
    REDUsr="${i#*=}"
    shift
    ;;
    -g=*|--red_pwd=*)
    REDPwd="${i#*=}"
    shift
    ;;
    -h=*|--red_tbl=*)
    REDTbl="${i#*=}"
    shift
    ;;
    -i=*|--red_dist=*)
    REDDist="${i#*=}"
    shift
    ;;
    -j=*|--red_sort=*)
    REDSort="${i#*=}"
    shift
    ;;
    -k=*|--red_map=*)
    REDMap="${i#*=}"
    shift
    ;;
    -l=*|--red_ins=*)
    REDIns="${i#*=}"
    shift
    ;;
    -m=*|--rds_cols=*)
    RDSCols="${i#*=}"
    shift
    ;;
    *)
    echo "unknown option"
    ;;
esac
done

echo "RDS Jdbc: $RDSJdbc"
echo "RDS Usr: $RDSUsr"
#echo "RDS Pwd: $RDSPwd"
echo "RDS Tbl: $RDSTbl"

echo "REDShift Jdbc: $REDJdbc"
echo "RED Usr: $REDUsr"
#echo "RED Pwd: $REDPwd"
echo "(Optional) REDShift Generated Tbl: $REDTbl"
echo "(Optional) REDShift Distribution Key: $REDDist"
echo "(Optional) REDShift Sort Key(s): $REDSort"
echo "(Optional) REDShift Default Translation Override Map: $REDMap"
echo "(Optional) REDShift Data Insert Mode: $REDIns"

# exit script on error
set -e

#1. Install MySQL client including mysqldump
sudo yum install mysql -y

#2. Install PSQL client
sudo yum install postgresql93 -y


#3. Parse RDS Jdbc Connect String
RDSHost=`echo $RDSJdbc | awk -F: '{print $3}' | sed 's/\///g'`
echo "RDS Host: $RDSHost"
RDSPort=`echo $RDSJdbc | awk -F: '{print $4}' | awk -F/ '{print $1}'`
echo "RDS Port: $RDSPort"
MySQLDb=`echo $RDSJdbc | awk -F: '{print $4}' | awk -F/ '{print $2}'`
echo "RDS MySQLDB: $MySQLDb"

#4. Parse Redshift Jdbc Connect String
#"jdbc:postgresql://eudb3.cvprvckckqrm.eu-west-1.redshift.amazonaws.com:5439/dbtest?tcpKeepAlive=true"
REDHost=`echo $REDJdbc | awk -F: '{print $3}' | sed 's/\///g'`
echo "REDShift Host: $REDHost"
REDPort=`echo $REDJdbc | awk -F: '{print $4}' | awk -F/ '{print $1}'`
echo "REDShift Port: $REDPort"
REDDb=`echo $REDJdbc | awk -F: '{print $4}' | awk -F/ '{print $2}' | awk -F? '{print $1}'`
echo "REDShift DB: $REDDb"

#5. Dump MySQL Table definition
MySQLFile=rdsmy$(date +%m%d%H%M%S).sql
echo "My SQL dump file: $MySQLFile"
`mysqldump -h $RDSHost --port=$RDSPort -u $RDSUsr --password=$RDSPwd  --compatible=postgresql --default-character-set=utf8 -n -d -r $MySQLFile $MySQLDb $RDSTbl`

#5a. Filter the table definition dumped to whitelisted columns
if [ -n "$RDSCols" ]; then
  START_TABLE='CREATE TABLE'
  END_TABLE='\);'
  COL_FILTER=$(echo $RDSCols | tr ',' '|')
  # Extended regex: match any of COL_FILTER elements as ` "x"` or `("x"`
  FILTER="(\s|\()\"($COL_FILTER)\""
  # Between $START_TABLE and $END_TABLE, keep only lines matching $FILTER
  sed -iE "/$START_TABLE/,/$END_TABLE/{/START_TABLE/n;/$END_TABLE/n;/$FILTER/! d}" $MySQLFile
fi

#6. Download the translator python script
curl -O https://s3.amazonaws.com/datapipeline-us-east-1/sample-scripts/mysql_to_redshift.py

#7. Translate MySQL to Redshift
RedFile=red$(date +%m%d%H%M%S).psql
python mysql_to_redshift.py --input_file=$MySQLFile --output_file=$RedFile --table_name=$REDTbl  --dist_key=$REDDist --sort_keys=$REDSort --map_types=$REDMap --insert_mode=$REDIns
echo "Generated Redshift file: $RedFile"

#8. Import it into Redshift
export PGPASSWORD=$REDPwd
psql -h $REDHost -p $REDPort -U $REDUsr -d $REDDb -f $RedFile
