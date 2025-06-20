import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
import { Check } from "lucide-react"; 
export default function ResolutionCard({
  outcome,
  outcomeId,
  eventType,
  market,
}) {
  const displayOutcome =
    eventType === "Binary"
      ? outcome
      : eventType === "Multiple Choice"
      ? market?._id === outcomeId
        ? "Yes"
        : "No"
      : "";

  return (
    <Card className="w-full bg-[#161616] border border-[#1f1f1f] rounded-md hover:shadow-md transition-all duration-200">
      <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="bg-[#00AEEF] p-3 rounded-full">
          <Check className="text-white w-6 h-6" />
        </div>
        <h4 className="text-[#00AEEF] font-semibold text-lg">Outcome: {displayOutcome}</h4>
        {eventType === "Multiple Choice" && (
          <p className="text-gray-400 text-sm">{market?.groupItemTitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
