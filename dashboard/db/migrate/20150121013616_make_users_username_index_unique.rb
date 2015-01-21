class MakeUsersIndexesUnique < ActiveRecord::Migration
  def change
    add_index "users", ["username"], name: "index_users_on_username", unique: true, using: :btree
    add_index "users", ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true, using: :btree
    add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
    add_index "users", ["prize_id"], name: "index_users_on_prize_id", unique: true, using: :btree
    add_index "users", ["teacher_bonus_prize_id"], name: "index_users_on_teacher_bonus_prize_id", unique: true, using: :btree
    add_index "users", ["teacher_prize_id"], name: "index_users_on_teacher_prize_id", unique: true, using: :btree
  end
end
