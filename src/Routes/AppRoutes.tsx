import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";
import Home from "../Components/Home/Home";
import Form from "../Components/Form/Form";
import Edit from "../Components/Home/Edit/Edit";



export function AppRoutes () {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/Form" element={<Form />} />
            <Route path="/Home/Edit" element={<Edit />} />
        </Routes>
        </BrowserRouter>
    )
}
