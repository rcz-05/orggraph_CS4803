import { DemoEngineerView } from "@/components/demo/demo-engineer-view";
import { DemoLoading } from "@/components/demo/demo-loading";

export const dynamic = "force-dynamic";

export default function LoadingPage() {
  return (
    <>
      <DemoEngineerView />
      <DemoLoading />
    </>
  );
}
