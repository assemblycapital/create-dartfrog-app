import "./App.css";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import { NoServiceView, HalfChat, HUB_NODE, IS_FAKE } from '@dartfrog/puddle';
import { PROCESS_NAME, WEBSOCKET_URL } from "./utils";
import useAppStore from "./store/store";
import PluginBox from "./components/PluginBox";

function App() {

  return (
    <Router basename={`/${PROCESS_NAME}`}>
      <Routes>
        <Route path="/" element={
          <NoServiceView processName={PROCESS_NAME} websocketUrl={WEBSOCKET_URL} ourNode={window.our?.node} />
        } />
        <Route path="/df/service/:id" element={<ServiceRoute />} />
      </Routes>
    </Router>
  );
}

function ServiceRoute({ customServiceId}: { customServiceId?: string }) {
  const { id } = useParams();
  const effectiveId = customServiceId || id;

  const {handleUpdate} = useAppStore();

  const onServiceMessage = (msg) => {
    if (msg.Clicker) {
      handleUpdate(msg.Clicker);
    }
  };

  return (
    <HalfChat
      ourNode={window.our?.node}
      Element={PluginBox}
      processName={PROCESS_NAME}
      websocketUrl={WEBSOCKET_URL}
      onServiceMessage={onServiceMessage}
      enableChatSounds
      paramServiceId={effectiveId}
    />
  );
}

export default App;
