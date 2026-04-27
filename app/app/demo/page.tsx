import { DemoEngineerView } from "@/components/demo/demo-engineer-view";
import { DemoConnectors } from "@/components/demo/demo-connectors";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <>
      <DemoEngineerView />
      <DemoConnectors />
    </>
  );
}
