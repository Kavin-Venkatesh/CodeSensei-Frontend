const HomePage = () =>{
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return(
        <>
            <h1>hello world ! {user.name}</h1>
        </>
    )
};

export default HomePage;