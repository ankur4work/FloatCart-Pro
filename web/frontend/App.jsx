import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <BrowserRouter>
      <AppBridgeProvider>
        <PolarisProvider>
          <QueryProvider>
            <Routes pages={pages} />
          </QueryProvider>
        </PolarisProvider>
      </AppBridgeProvider>
    </BrowserRouter>
  );
}
