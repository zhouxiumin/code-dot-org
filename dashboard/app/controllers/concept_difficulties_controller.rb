class ConceptDifficultiesController < ApplicationController
  # GET /concept_difficulties
  def index
    @concepts = LevelConceptDifficulty::CONCEPTS
    @matrix = @concepts.map do |concept_a|
      @concepts.map do |concept_b|
        LevelConceptDifficulty.relative_incidence(concept_a, concept_b).last
      end
    end
  end
end
