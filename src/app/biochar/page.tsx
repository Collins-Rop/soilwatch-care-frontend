import BiocharDashboard from "../../components/BiocharDashboard";
import { loadBiocharData } from "./ona";

export const dynamic = "force-dynamic";

export default async function BiocharPage() {
  const dataSource = await loadBiocharData();
  return <BiocharDashboard dataSource={dataSource} />;
}
