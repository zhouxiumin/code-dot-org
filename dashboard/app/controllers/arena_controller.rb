class ArenaController < ApplicationController
  before_action :set_level, only: [:show]

  @@level_concept_cache = {}

  # GET /arena
  def show
    @never_autoplay_video = true

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
    @level =
      if arena_params[:level_id]
        Level.cache_find(arena_params[:level_id])
      elsif arena_params[:concept]
        cached_level_for_concept(arena_params[:concept].to_sym)
      end
    @game = @level.game
  end

  def cached_level_for_concept(concept)
    # Find all non-trivial levels (concept difficulty 2-5).
    @@level_concept_cache[concept] ||= LevelConceptDifficulty.with_difficulty(concept => (2..5)).pluck(:level_id)

    # Pick one level at random.
    Level.cache_find(@@level_concept_cache[concept].sample)
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def arena_params
    params.permit(:level_id, :concept)
  end
end
