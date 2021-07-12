import './App.css';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

import { firebaseConfig } from './config'

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const firestore = firebase.firestore()

function SingIn () {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }

  return <button onClick={signInWithGoogle}>Sign in with Google</button>
}

function SignOut () {
  return auth.currentUser && (
    <button className="SignOut" onClick={() => auth.signOut()}>
      Sign Out
    </button>
  )
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, {idField: 'id'})

  const sendMessage = async(e) => {
    e.preventDefault();

    const input = e.target && e.target.formMessage;
    const { uid, photoURL } = auth.currentUser

    if(!input || !input.value) return;

    await messagesRef.add({
      text: input.value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    input.value = ''
  }

  return (
    <>
      <div className="ChatRoom">
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg.text} photo={msg.photoURL}/>)}
        </div>
        <form onSubmit={sendMessage}>
          <input type='text' name="formMessage" placeholder="type something nice"/>
          <button type="submit">send</button>
        </form>
      </div>
      <SignOut />
    </>
  )
}

function ChatMessage({ message, photo }) {
  return (
    <div className="ChatMessage">
      <div className="ChatMessageImg">
        <img src={photo}/>
      </div>
      <p>{message}</p>
    </div>
  )
}

function App() {
  const [user] = useAuthState(auth)

  return (
    <div className="App">
      <header className="App-header">
        {user ? <ChatRoom /> : <SingIn />}
      </header>
    </div>
  );
}

export default App;
