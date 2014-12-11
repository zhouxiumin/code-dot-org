require 'open-uri'
# video_keys = %w(maze_intro loop_times loop_until if if_else_scrat)
video_keys = %w(flappy_intro)
video_keys.each do |key|
  open("#{key}.html", 'wb') do |file|
    file << open("http://test.learn.code.org/notes/#{key}").read
  end
end
