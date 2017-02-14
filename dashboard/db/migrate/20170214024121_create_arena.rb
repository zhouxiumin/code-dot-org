class CreateArena < ActiveRecord::Migration[5.0]
  def change
    create_table :arenas do |t|
      t.references :user, foreign_key: true
      t.references :level, foreign_key: true
      t.text :properties

      t.timestamps
    end
  end
end
