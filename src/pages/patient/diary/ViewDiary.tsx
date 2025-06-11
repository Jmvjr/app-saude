import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/ui/header";
import { DiaryService } from "@/api/services/DiaryService";
import HabitCard from "@/components/ui/habit-card";
import { ErrorMessage } from "@/components/ui/error-message";

// Updated interfaces to match actual server response structure
interface DiaryTrigger {
  trigger: string;
  value: string;
}

interface DiaryInterestArea {
  interest: string;
  shared_with_provider: boolean;
  triggers: DiaryTrigger[];
}

interface DiaryEntry {
  observation_id: number;
  value_as_string: string;
  shared_with_provider: boolean;
  created_at: string;
}

interface DiaryData {
  diary_id: number;
  date: string;
  scope: string; // 'today' or 'since_last' instead of date_range_type
  entries: DiaryEntry[];
  interest_areas: DiaryInterestArea[];
}

export default function ViewDiaryEntry() {
  const { diaryId } = useParams<{ diaryId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [diary, setDiary] = useState<DiaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiaryData = async () => {
      if (!diaryId) return;

      try {
        setIsLoading(true);
        console.log(`Fetching diary with ID: ${diaryId}`);

        // Fetch diary by ID
        const response = await DiaryService.diariesRetrieve2(diaryId);
        console.log("Diary API response:", response);

        if (response) {
          console.log("Diary entries:", response.entries);
          console.log("Diary interest areas:", response.interest_areas);
        }

        if (response && response.diary_id) {
          setDiary(response);
        } else {
          console.error(
            "Diary not found or invalid response format:",
            response,
          );
          setError("Diário não encontrado ou formato inválido.");
        }
      } catch (error) {
        console.error("Error fetching diary:", error);
        setError("Falha ao carregar o diário. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    if (diaryId) {
      fetchDiaryData();
    }
  }, [diaryId]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Get general text entry if available
  const getGeneralTextEntry = (): { text: string; shared: boolean } | null => {
    if (!diary || !Array.isArray(diary.entries) || diary.entries.length === 0) {
      return null;
    }

    for (const entry of diary.entries) {
      if (
        typeof entry.value_as_string === "string" &&
        entry.value_as_string.trim() !== ""
      ) {
        return {
          text: entry.value_as_string,
          shared: !!entry.shared_with_provider,
        };
      }
    }

    return null;
  };

  const clearError = () => {
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header title="Visualizar Diário" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header
          title="Visualizar Diário"
          onBackClick={() => navigate("/diary")}
        />

        <ErrorMessage
          message={error || "Diário não encontrado"}
          variant="destructive"
          onClose={clearError}
        />

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray12 hover:bg-gray2 rounded-full text-white"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const textEntry = getGeneralTextEntry();
  const hasContent =
    (textEntry && textEntry.text) ||
    (diary.interest_areas &&
      diary.interest_areas.some((area) => {
        // Check if it's the new format with interest and triggers
        return area.triggers.some((trigger) => trigger.value);
      }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Header
        title="Visualizar Diário"
        onBackClick={() => navigate(-1)}
        subtitle={diary.date ? formatDate(diary.date) : "Data não disponível"}
      />

      {!hasContent && (
        <div className="bg-gray-50 p-6 rounded-lg text-center my-8">
          <p className="text-gray-500 text-lg">
            Este diário não possui conteúdo.
          </p>
        </div>
      )}

      {/* Time Range Section */}
      <div className="space-y-3 mb-6 mt-6">
        <h3 className="font-semibold text-lg text-neutral-700 mb-1">
          Período de tempo
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>{diary.scope === "today" ? "Hoje" : "Desde o último diário"}</p>
        </div>
      </div>

      {/* Interest Areas Section - Only show if there are interests with responses */}
      {/* Interest Areas Section - Only show if there are interests with responses */}
      {diary.interest_areas && diary.interest_areas.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg text-neutral-700 mb-1">
              Seus Interesses
            </h3>
          </div>

          <div className="space-y-6">
            {diary.interest_areas.map((area, index) => {
              // Check if it's the new format
              if (area.interest && area.triggers) {
                // New format - filter triggers with responses
                const triggersWithResponses = area.triggers.filter(
                  (t) => t.value,
                );
                console.log("Trigger value:", triggersWithResponses); // Debugging line

                if (triggersWithResponses.length === 0) return null;

                return (
                  <div key={index} className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <HabitCard
                          title={area.interest || "Interesse"}
                          className="inline-block w-auto min-w-fit max-w-full"
                        />
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-gray-200 pl-4">
                      {triggersWithResponses.map((trigger, idx) => (
                        <div key={idx} className="mt-3 space-y-2">
                          {/* Trigger name as question */}
                          <div className="font-medium text-sm text-neutral-700 mb-1">
                            {trigger.trigger || "Pergunta"}
                          </div>

                          {/* Show the trigger value directly */}
                          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                            {typeof trigger.value === "object" &&
                            trigger.value.value
                              ? trigger.value.value
                              : typeof trigger.value === "string"
                                ? trigger.value
                                : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Text Section - Only show if there's text */}
      {textEntry && textEntry.text && (
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg text-neutral-700 mb-1">
              Observações Gerais
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Compartilhado com profissionais:{" "}
                {textEntry.shared ? "Sim" : "Não"}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap min-h-[150px]">
            {textEntry.text}
          </div>
        </div>
      )}
    </div>
  );
}
