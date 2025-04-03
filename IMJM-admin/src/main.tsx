import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// ReactDOM.createRoot(document.getElementById('root')).render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// );
// TypeScript 오류 해결을 위해 non-null assertion 추가
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);