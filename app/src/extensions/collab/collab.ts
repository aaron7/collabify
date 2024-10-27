import { yCollab } from 'y-codemirror.next';
import { WebrtcProvider } from 'y-webrtc';
import { UndoManager } from 'yjs';

type PluginProps = {
  webrtcProvider: WebrtcProvider;
};

const createCollabPlugin = ({ webrtcProvider }: PluginProps) => {
  if (webrtcProvider === null) {
    return;
  }

  const ydoc = webrtcProvider.doc;

  const ytext = ydoc.getText('content');
  const undoManager = new UndoManager(ytext);

  return yCollab(ytext, webrtcProvider.awareness, { undoManager });
};

export default createCollabPlugin;
