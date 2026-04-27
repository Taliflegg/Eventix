import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CardWrapper from "./CardWrapper";
import { FaUtensils } from "react-icons/fa";
import { activeMealTRain } from "../services/analyticsService";
// import {AnalyticsActiveMealTRain} from "../services/mealTrainService"

const AnalyticsActiveMealTRain: React.FC = () => {

    const MealIcon1 = FaUtensils as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

    const { t }: { t: (key: string) => string } = useTranslation();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const[numActiv,setNumActiv]=useState<number>(0);

    useEffect(() => {
  const getNum = async () => {
    try {
      const res = await activeMealTRain();
      if(res.activeMealTrains!==undefined){
        setNumActiv(res.activeMealTrains)
      }
      else{
        setNumActiv(-1)
      }
    } catch (error: any) {
      setError(error.message || 'שגיאה לא ידועה');
      console.error("Error fetching new users count:", error);
      console.log("שגיאה מלאה:", JSON.stringify(error, null, 2));

    } finally {
      setLoading(false);
    }
  };

  getNum();
}, []); 

    
    return <>
        <CardWrapper
        title={t("AnalyticsActiveMealTRain.title")}
        icon={<MealIcon1 className="text-4xl text-green-600" />}
        value={
             loading ? (
          <span className="text-3xl font-bold text-gray-700">
            {t('common.loading')}...
          </span>
        ) : error ? (
          <span className="text-xl font-bold text-red-600">
            {t('common.error')}: {error}
          </span>
        ) : (
          <span className="text-4xl font-bold text-gray-800">
            {numActiv}
          </span>
        )
        }
        description={t("AnalyticsActiveMealTRain.description")}
        />

    </>
}
export default AnalyticsActiveMealTRain