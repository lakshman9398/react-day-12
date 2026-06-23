import React, {
  useState,
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const UserContext = createContext();

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: Date.now(),
          name: action.payload,
          completed: false,
        },
      ];

    case "DELETE":
      return state.filter((item) => item.id !== action.payload);

    case "COMPLETE":
      return state.map((item) =>
        item.id === action.payload
          ? { ...item, completed: !item.completed }
          : item
      );

    default:
      return state;
  }
}

// Dashboard Component
function Dashboard({
  subjects,
  input,
  setInput,
  addSubject,
  completeSubject,
  deleteSubject,
}) {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const stats = useMemo(() => {
    const total = subjects.length;
    const completed = subjects.filter((s) => s.completed).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [subjects]);

  return (
    <div>
      <h2>Study Planner Dashboard</h2>

      <input
        ref={inputRef}
        type="text"
        placeholder="Enter Subject"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={addSubject}>Add Subject</button>

      <h3>Statistics</h3>

      <p>Total: {stats.total}</p>

      <p>Completed: {stats.completed}</p>

      <p>Pending: {stats.pending}</p>

      <hr />

      {subjects.length === 0 && <p>No Subjects Added</p>}

      {subjects.map((subject) => (
        <div
          key={subject.id}
          style={{
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              textDecoration: subject.completed
                ? "line-through"
                : "none",
              marginRight: "10px",
            }}
          >
            {subject.name}
          </span>

          <button
            onClick={() => completeSubject(subject.id)}
          >
            {subject.completed
              ? "Undo"
              : "Complete"}
          </button>

          <button
            onClick={() => deleteSubject(subject.id)}
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

// Profile Component
function Profile() {
  const user = useContext(UserContext);

  return (
    <div>
      <h2>Profile</h2>

      <p>
        <strong>Name:</strong> {user}
      </p>
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [username, setUsername] = useState("");

  const [page, setPage] = useState("dashboard");

  const [input, setInput] = useState("");

  const [subjects, dispatch] = useReducer(reducer, [], () => {
    const data = localStorage.getItem("subjects");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "subjects",
      JSON.stringify(subjects)
    );
  }, [subjects]);

  const addSubject = useCallback(() => {
    if (input.trim() === "") return;

    dispatch({
      type: "ADD",
      payload: input,
    });

    setInput("");
  }, [input]);

  const deleteSubject = useCallback((id) => {
    dispatch({
      type: "DELETE",
      payload: id,
    });
  }, []);

  const completeSubject = useCallback((id) => {
    dispatch({
      type: "COMPLETE",
      payload: id,
    });
  }, []);

  if (!loggedIn) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <h1>Study Planner Login</h1>

        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <br />

        <br />

        <button
          onClick={() => {
            if (username.trim() !== "") {
              setLoggedIn(true);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <UserContext.Provider value={username}>
      <div style={{ padding: "20px" }}>
        <h1>Welcome {username}</h1>

        <button
          onClick={() =>
            setPage("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          onClick={() =>
            setPage("profile")
          }
          style={{ marginLeft: "10px" }}
        >
          Profile
        </button>

        <button
          style={{ marginLeft: "10px" }}
          onClick={() => {
            setLoggedIn(false);
            setUsername("");
          }}
        >
          Logout
        </button>

        <hr />

        {page === "dashboard" ? (
          <Dashboard
            subjects={subjects}
            input={input}
            setInput={setInput}
            addSubject={addSubject}
            deleteSubject={deleteSubject}
            completeSubject={completeSubject}
          />
        ) : (
          <Profile />
        )}
      </div>
    </UserContext.Provider>
  );
}

export default App;