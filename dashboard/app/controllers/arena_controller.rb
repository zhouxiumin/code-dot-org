class ArenaController < ApplicationController
  before_action :set_level, only: [:show]

  # GET /arenas
  def show
    view_options(
      full_width: true,
      callouts: [],
      small_footer: (@game.uses_small_footer? || @level.enable_scrolling?),
      has_i18n: @game.has_i18n?,
      game_display_name: data_t("game.name", @game.name)
    )
    render 'levels/show'
  end

  private

  def set_level
    @level = Level.cache_find(arena_params)
    @game = @level.game
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def arena_params
    params.require(:level_id)
  end
end
