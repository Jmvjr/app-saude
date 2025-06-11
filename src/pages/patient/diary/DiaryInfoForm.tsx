import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioCheckbox } from "@/components/forms/radio-checkbox";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/forms/text_input";
import { Button } from "@/components/forms/button";
import { DiaryService } from "@/api/services/DiaryService";
import { DateRangeTypeEnum } from "@/api";
import { InterestAreasService } from "@/api/services/InterestAreasService";
import type { InterestArea } from "@/api/models/InterestArea";
import { SuccessMessage } from "@/components/ui/success-message";
import { ErrorMessage } from "@/components/ui/error-message";
import CollapsibleInterestCard from "@/components/ui/CollapsibleInterestCard";

// Interfaces tipadas
interface Trigger {
  trigger_name: string;
  custom_trigger_name: string | null;
  observation_concept_id: number;
  trigger_id: number;
  value_as_string: string | null;
  response?: string;
  shared?: boolean;
}

interface UserInterest extends InterestArea {
  interest_area_id: number;
  interest_name?: string;
  response?: string;
  shared?: boolean;
  triggers?: Trigger[];
}

export default function DiaryInfoForm() {
  const navigate = useNavigate();

  // Estados principais
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Estados do formulário
  const [openTriggers, setOpenTriggers] = useState<Record<number, boolean>>({});
  const [timeRange, setTimeRange] = useState<"today" | "sinceLast">(
    "sinceLast"
  );
  const [freeText, setFreeText] = useState("");
  const [shareText, setShareText] = useState(false);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);

  // Carrega interesses do usuário
  useEffect(() => {
    const fetchUserInterests = async () => {
      console.log("Carregando interesses do usuário...");
      setIsLoadingInterests(true);

      try {
        const response = await InterestAreasService.personInterestAreasList();
        console.log("API Response:", response);

        // Check if response is empty
        if (!response) {
          console.warn("Nenhum interesse encontrado");
          setUserInterests([]);
          return;
        }

        // Extract the dictionary from the response
        const interestDict = response.interest_area_dict || {};
        const observationId = response.observation_id || 0;

        // Transform the dictionary into an array of UserInterest objects
        const formattedInterests: UserInterest[] = Object.entries(
          interestDict
        ).map(([interestName, triggersList], index) => {
          // Make sure triggersList is treated as an array
          const triggersArray = Array.isArray(triggersList)
            ? triggersList
            : typeof triggersList === "object" && triggersList !== null
            ? Object.values(triggersList)
            : [String(triggersList)];

          return {
            interest_area_id: observationId + index,
            interest_name: interestName,
            observation_concept_id: 0,
            triggers: triggersArray.map((name) => ({
              trigger_name: name,
              custom_trigger_name: null,
              observation_concept_id: 0,
              trigger_id: index * 1000 + triggersArray.indexOf(name), // Generate unique IDs
              value_as_string: null,
              response: "",
              shared: false,
            })),
            response: "",
            shared: false,
          };
        });

        console.log("Interesses formatados:", formattedInterests);
        setUserInterests(formattedInterests);
      } catch (error) {
        console.error("Erro ao carregar interesses:", error);
        // Dados de teste para desenvolvimento
        setUserInterests([
          {
            interest_area_id: 1,
            observation_concept_id: null,
            custom_interest_name: "Teste Interesse 1",
            value_as_string: "Teste Interesse 1",
            response: "",
            shared: false,
            triggers: [
              {
                trigger_name: "Como você se sentiu hoje?",
                custom_trigger_name: null,
                observation_concept_id: 1001,
                trigger_id: 1,
                value_as_string: null,
                response: "",
              },
            ],
          },
        ]);
      } finally {
        setIsLoadingInterests(false);
      }
    };

    fetchUserInterests();
  }, []);

  // Handlers para interesses
  const toggleInterest = (interestId: number) => {
    setOpenTriggers((prev) => ({
      ...prev,
      [interestId]: !prev[interestId],
    }));
  };

  const handleInterestResponseChange = (
    interestId: number,
    response: string
  ) => {
    setUserInterests((prev) =>
      prev.map((interest) =>
        interest.interest_area_id === interestId
          ? { ...interest, response }
          : interest
      )
    );
  };

  const handleInterestSharingToggle = (interestId: number, shared: boolean) => {
    setUserInterests((prev) =>
      prev.map((interest) =>
        interest.interest_area_id === interestId
          ? { ...interest, shared }
          : interest
      )
    );
  };

  const handleTriggerResponseChange = (
    interestId: number,
    triggerId: number,
    response: string
  ) => {
    setUserInterests((prev) =>
      prev.map((interest) =>
        interest.interest_area_id === interestId
          ? {
              ...interest,
              triggers:
                interest.triggers?.map((trigger) =>
                  trigger.trigger_id === triggerId
                    ? { ...trigger, response }
                    : trigger
                ) || [],
            }
          : interest
      )
    );
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Novo formato de interesse baseado nos tipos FullInterestArea e InterestAreaTrigger
      const interestAreaDict: Record<
        string,
        { trigger_dict: Record<string, any> }
      > = {};

      // Filtrar interesses com respostas
      userInterests
        .filter(
          (interest) =>
            interest.response?.trim() !== "" ||
            interest.triggers?.some((t) => t.response?.trim() !== "")
        )
        .forEach((interest) => {
          // Criar objeto para cada interesse
          const interestName =
            interest.interest_name || `interest_${interest.interest_area_id}`;
          const triggerDict: Record<string, any> = {};

          // Adicionar resposta geral do interesse, se existir
          if (interest.response?.trim()) {
            triggerDict["general_response"] = {
              value: interest.response,
              shared: interest.shared || false,
            };
          }

          // Adicionar respostas de triggers
          interest.triggers?.forEach((trigger) => {
            if (trigger.response?.trim()) {
              triggerDict[trigger.trigger_name] = {
                trigger_id: trigger.trigger_id,
                value: String(trigger.response), // Ensure value is a string
                shared: trigger.shared || false,
              };
            }
          });

          // Só adiciona o interesse se tiver pelo menos uma resposta
          if (Object.keys(triggerDict).length > 0) {
            interestAreaDict[interestName] = {
              trigger_dict: triggerDict,
            };
          }
        });

      const diary_shared =
        shareText || userInterests.some((interest) => interest.shared);

      const diary = {
        date_range_type:
          timeRange === "today"
            ? DateRangeTypeEnum.TODAY
            : DateRangeTypeEnum.SINCE_LAST,
        text: freeText,
        text_shared: shareText,
        diary_shared: diary_shared,
        interest_areas: {
          interest_area_dict: interestAreaDict, // Wrap in object with interest_area_dict property
        },
      };

      console.log("Enviando diário:", diary);

      await DiaryService.diariesCreate(diary);
      setSubmitSuccess(true);

      // Redireciona após sucesso
      setTimeout(() => {
        navigate("/diary");
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar diário:", error);
      setSubmitError(
        "Ocorreu um erro ao salvar o diário. Por favor, tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSubmitError = () => {
    setSubmitError(null);
  };

  // Estatísticas do formulário
  const totalInterests = userInterests.length;
  const answeredInterests = userInterests.filter(
    (interest) =>
      interest.response?.trim() ||
      interest.triggers?.some((t) => t.response?.trim())
  ).length;

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mensagens de status */}
        {submitSuccess && (
          <SuccessMessage message="Diário salvo com sucesso! Redirecionando..." />
        )}

        {submitError && (
          <ErrorMessage
            message={submitError}
            onClose={clearSubmitError}
            onRetry={clearSubmitError}
            variant="destructive"
          />
        )}

        {/* Seção de Período de Tempo */}
        <section className="space-y-3">
          <h3 className="font-semibold text-lg text-accent2-700">
            A qual período de tempo esse diário se refere?
          </h3>
          <div className="flex flex-col gap-2">
            <RadioCheckbox
              id="today"
              label="Hoje"
              checked={timeRange === "today"}
              onCheckedChange={() => setTimeRange("today")}
              className="py-2"
            />
            <RadioCheckbox
              id="sinceLast"
              label="Desde o último diário"
              checked={timeRange === "sinceLast"}
              onCheckedChange={() => setTimeRange("sinceLast")}
              className="py-2"
            />
          </div>
        </section>

        {/* Seção de Interesses do Usuário */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-accent2-700">
              Seus Interesses
            </h3>
            {totalInterests > 0 && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {answeredInterests}/{totalInterests} respondidos
              </span>
            )}
          </div>

          {isLoadingInterests ? (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-selection border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-typography">Carregando seus interesses...</p>
              </div>
            </div>
          ) : totalInterests === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-typography text-sm mb-2">
                Você ainda não tem interesses cadastrados.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/user-main")}
              >
                Adicionar Interesses
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userInterests.map((interest) => (
                <CollapsibleInterestCard
                  key={interest.interest_area_id}
                  interest={interest}
                  isOpen={openTriggers[interest.interest_area_id] || false}
                  onToggle={() => toggleInterest(interest.interest_area_id)}
                  onResponseChange={(response) =>
                    handleInterestResponseChange(
                      interest.interest_area_id,
                      response
                    )
                  }
                  onSharingToggle={(shared) =>
                    handleInterestSharingToggle(
                      interest.interest_area_id,
                      shared
                    )
                  }
                  onTriggerResponseChange={(triggerId, response) =>
                    handleTriggerResponseChange(
                      interest.interest_area_id,
                      triggerId,
                      response
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Seção de Observações Gerais */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-accent2-700">
              Observações Gerais
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 italic">
                Compartilhar com profissionais
              </span>
              <Switch
                checked={shareText}
                onCheckedChange={setShareText}
                size="sm"
              />
            </div>
          </div>
          <TextField
            id="freeText"
            name="freeText"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Descreva como você se sente ou qualquer observação importante..."
            className="border-gray2 border-2 focus:border-selection"
            multiline={true}
            rows={4}
          />
        </section>

        {/* Botão de Submissão */}
        <div className="pt-6 text-center">
          <Button
            variant="orange"
            size="lg"
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-[280px] text-typography mx-auto py-3 text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </span>
            ) : (
              "SALVAR DIÁRIO"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
