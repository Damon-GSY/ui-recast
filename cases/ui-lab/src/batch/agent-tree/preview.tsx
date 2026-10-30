import {createRoot} from 'react-dom/client';
import '@fontsource-variable/inter';
import Study from './Study';
createRoot(document.getElementById('root')!).render(<div style={{maxWidth:1000,margin:'0 auto'}}><Study initialMode={new URLSearchParams(location.search).has('source')?'source':'integration'}/></div>);
