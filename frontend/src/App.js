import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Register from './Register_Login/Register';
import Login from './Register_Login/Login';
import NoteEditor from './Notes/NoteEditor';
import Dashboard from './Notes/Dashboard';
import SharedNotes from './Notes/ShareNotes';
import CreateNote from './Notes/CreateNote';
import MyNotes from './Notes/MyNotes';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* <Route path="/" element={<Home/>}/> */}
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/note-editor" element={<NoteEditor/>}/>
        <Route path="/" element={<Dashboard/>}/>
          <Route path="my-notes" element={<MyNotes />} />
          <Route path="shared-notes" element={<SharedNotes />} />
          <Route path="create" element={<CreateNote />} />
      </Routes>
    </div>
  );
}

export default App;
