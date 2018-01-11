set title "S3 Package Sizes"
set terminal png size 1024,768
set output "/tmp/s3_package_sizes.png"
set pointsize 0.2
set datafile separator ","

set timefmt "%Y-%m-%d %H:%M:%S UTC"
set xdata time
set format x "%m/%y"

set ylabel "Size"
set yrange [0:*]
set format y "%'.0f"
set decimal locale

plot "/tmp/s3_package_sizes.csv" using 5:1 title "js/common.js" with linespoints smooth unique, \
  "/tmp/s3_package_sizes.csv" using 5:2 title "js/essential.js" with linespoints smooth unique, \
  "/tmp/s3_package_sizes.csv" using 5:3 title "js/code-studio-common.js" with linespoints smooth unique, \
  "/tmp/s3_package_sizes.csv" using 5:4 title "js/code-studio.js" with linespoints smooth unique
