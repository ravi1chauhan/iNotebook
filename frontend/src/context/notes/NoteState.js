import noteContext from "./noteContext";
import { useState } from "react";

const NoteState = (props)=>{
    const s1 = {
        "name": "Ravi",
        "class": "5b"
    }
    const [state, setState] = useState(s1);

    const update = ()=>{
        setTimeout(() => {
            setState ({
                "name": "Bavi",
                "class": "9b"
            })
        }, 1000);
    }
    
    return (
        <noteContext.Provider value={{state, update}} >
            {props.children}
        </noteContext.Provider>
    )
}

export default NoteState;