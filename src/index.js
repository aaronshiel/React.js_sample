import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'

//Displays when user is trying to create a new event inside a planner
class CreateEventDisplay extends Component{
    constructor(props) {
        super(props);
        //these values are what are sent up to the database
        this.state={
            date: "",
            description: "",
            current_user: this.props.current_user,
            plannerID: this.props.current_planner_id,
        };

        this.handleEventCreate = this.handleEventCreate.bind(this);
        this.handleDate = this.handleDate.bind(this);
        this.handleDescription = this.handleDescription.bind(this);
    }

    //TODO: make all handle events into one method, for other classes too
    //updates date state value
    handleDate(event){
        this.setState({
            date: event.target.value,
        })
    }

    //updates description state value
    handleDescription(event){
        this.setState({
            description: event.target.value,
        })
    }

    //called when user is trying to create a new event
    //Posts a new event to database
    handleEventCreate(){
        let data = new URLSearchParams();
        data.append('username', this.state.current_user);
        data.append('date', this.state.date);
        data.append('description', this.state.description);
        data.append('plannerID', this.state.plannerID);

        const options = {
              method: 'post',
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
                 body: data,
            json: true,
        };
        fetch('http://127.0.0.1:5000/new_event' , options)
            .then(response =>{
                if(response.ok){
                    //re-render the event list since we have a new one, method comes from parent component
                    this.props.refresh_event_list();
                }else{
                    console.log("Error creating new event");
                }
            })
    }

    render(){
        return(
            <div>
                {/*TODO: why is this script is the only one being considered*/}
                <script>
                    {
                        window.onclick = function(event){
                        if(event.target === document.getElementById("create_event_modal")){
                            document.getElementById("create_event_modal").setAttribute("style", "display: none; z-index: -1");
                        }
                        if(event.target === document.getElementById("delete_event_modal")){
                            document.getElementById("delete_event_modal").setAttribute("style", "display: none; z-index: -1");
                        }
                    }}
                </script>
                <div className={"modal"} id={"create_event_modal"}>
                    <div className={"modal-content"}>
                        <label>
                            Date:
                            <input id={"date-edit-input"} value={this.state.date} onChange={this.handleDate}>
                            </input>
                        </label>
                        <br/>
                        <label>
                            Description:
                            <input id={"description-edit-input"} value={this.state.description} onChange={this.handleDescription}>
                            </input>
                        </label>
                        <br/>
                        <br/>
                        <button className={"Event-Button"} onClick={this.handleEventCreate}>
                            Create Event
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

// Displayed when a user presses the "delete" button on an event
// Popup UI asking user if they'd like to delete relevant event
class DeleteEventDisplay extends Component{
    constructor(props) {
        super(props);

        this.state={
            event_id_to_delete : this.props.event_id_to_delete,
        }
    }

    //TODO: Implement event delete method

    render() {
        return(
            <div>
                <div className={"modal"} id={"delete_event_modal"}>
                    <div className={"modal-content"}>
                        <label>
                            Are you sure you want to delete this event?
                            <button className={"Event-Button"}>
                                Yes
                            </button>
                            <button className={"Event-Button"}>
                                No
                            </button>
                        </label>
                    </div>
                </div>
            </div>
        )
    }
}

//Displays when a user accesses a planner
class DisplayPlanner extends Component{
    constructor(props){
        super(props);

        this.state={
            /*TODO: create a list of event objects, instead of having all the values*/
            /*TODO: separated in arrays, memory leakage could occur*/
            loading:true,
            creator_name: null,
            members_allowed: null,
            password: null,
            related_events: null,
            title: null,
            current_user: this.props.current_user,
            current_planner_id : this.props.current_planner_id,

            //to be used to determine queue of fetches left
            eventFetchQueue: 0,

            event_count: 0,
            event_names: [],
            event_dates: [],
            event_descriptions: [],
            event_creator_names: [],
        };
        this.GetPlannerInfo = this.GetPlannerInfo.bind(this);
        this.getEvents = this.getEvents.bind(this);
        this.renderEvents = this.renderEvents.bind(this);
    }

    //called at start, gathers the planner info, then gathers all the Event info
    //backend requires planner_id (parent planner id)
    GetPlannerInfo(){
        //getting planner info
        let data = new URLSearchParams();
        data.append('planner_id', this.state.current_planner_id);
        const options = {
              method: 'post',
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
                 body: data,
            json: true,
        };
        //TODO: use redux to hold info
        fetch('http://127.0.0.1:5000/get_planner_info' , options)
            .then(response =>{
                if(response.ok){
                    response.json().then(data => {
                        this.setState({
                            creator_name: data.creator_name,
                            members_allowed: data.members_allowed,
                            password: data.password,
                            related_events: data.related_events.split(','),
                            title: data.title,
                        });
                        //check if we have any events, if so, update them!
                        if(data.related_events !== ""){
                            this.setState({
                                event_count: this.state.related_events.length,
                            });
                        }//else it just stays 0, good!
                    })
                        //we need to down how many events are going to be queued
                        .then(()=> this.setState({
                            eventFetchQueue: this.state.event_count
                            })
                        )
                        .then(() =>
                            //getting event info
                        {this.getEvents(this.state.related_events.length);}
                        );

                }else{
                    response.json().then(data =>{
                        console.log(data);
                    })
                }
            });
    }

    componentDidMount() {
        this.GetPlannerInfo();
    }

    //Called by GetPlannerInfo once planner info id retrieved
    //all events and their info are gathered and stored as arrays here
    async getEvents(){
        //if there are no events to be queried
        if(this.state.event_count === 0) {
            this.setState({
                eventFetchQueue: 0,
                loading:false,
            });
            return;
        }
        //TODO: use redux to hold info
        //TODO: implement promise.all to grab all events at once
        //query each event
        for(let i = 0; i < this.state.event_count; i += 1) {
            let data = new URLSearchParams();
            data.append('event_id', this.state.related_events[i]);
            const options = {
                method: 'post',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: data,
                json: true,
            };
            await fetch('http://127.0.0.1:5000/get_event_info', options)
                .then(response => {
                    let events = [];
                    events = events.concat(this.state.event_dates);
                    let descriptions = [];
                    descriptions = descriptions.concat(this.state.event_descriptions);
                    let names = [];
                    names = names.concat(this.state.event_creator_names);
                    if (response.ok) {
                        response.json().then(data => {
                            events.push(data.date);
                            descriptions.push(data.description);
                            names.push(data.creator_name);
                            this.setState({
                                //sometimes this causes an error
                                event_dates: events,
                                event_descriptions: descriptions,
                                event_creator_names: names,
                            });
                        })
                            .then(() =>{
                                //for every event successfully retrieved, reduce eventQueue by 1
                                this.setState({
                                    eventFetchQueue: this.state.eventFetchQueue - 1,
                                    loading:false,
                                });
                            })
                    } else {
                        if(response.status === 404){
                            console.log("could not find that event");
                            //for every event unsuccessfully retrieved, reduce eventQueue by 1
                            this.setState({
                                    eventFetchQueue: this.state.eventFetchQueue - 1,
                                    loading:false,
                                });
                        }
                    }

                });
        }
    }

    //Called once all event info is retrieved
    //displays each event as a singular component
    renderEvents(){
        //if there are no events to render, do nothing
        if(this.state.event_count === 0)
            return (
              <div>
                  No events found!
              </div>
            );
        let list = [];
        //used to float buttons
        let float_left = {
                float: 'left',
            };
        let float_right = {
                float: 'right',
            };

        for (let i = 0; i < this.state.event_count; i += 1) {
            //TODO: make this a separate object, pass in props
            list.push(
                <div className={"User-Event"} key={i}>
                    <h3>
                        {this.state.event_dates[i]}
                    </h3>
                    <div>
                        {this.state.event_descriptions[i]}
                    </div>
                    <br/>
                    <div>
                        Created by: {this.state.event_creator_names[i]}
                    </div>
                    <br/>
                    <button className={"Event-Button"} style={float_left}>I'm going!</button>
                    <button className={"Event-Button"} style={float_right}>Edit</button>
                    {/*TODO: get this to open the delete event modal*/}
                    <button className={"Event-Button"} style={float_right}
                            onClick={() => {
                                document.getElementById("delete_event_modal").setAttribute("style", "display: block; z-index: 2");
                            console.log("Here")}}>Delete</button>
                </div>
            );
        }
        return list;
    }

    render(){
        //if we are still fetching event/planner info
        if(this.state.loading || this.state.eventFetchQueue > 0) {
            return (
                <div>
                    Loading, please wait...
                </div>
            );
        }else{
            //We have planner and event info, start rendering
            let event_list = this.renderEvents();
            let float_left = {
                float: 'left'
            };
            return(
                <div>
                    <h1 className={"Planner-Title"}>
                        {/*back arrow button on planner page*/}
                        <button className={"Back-Arrow"} onClick={() =>{
                            this.props.onClickReturn();
                        }}>
                        </button>
                        {this.state.title}
                    </h1>
                    {/*create new event button info*/}
                    <DeleteEventDisplay>
                        h
                    </DeleteEventDisplay>
                    <CreateEventDisplay current_user={this.state.current_user}
                                 current_planner_id={this.state.current_planner_id}
                                        //method passed in refreshes page
                                        refresh_event_list={()=> {
                                            //reset values on page
                                            this.setState({
                                                event_names: [],
                                                event_dates: [],
                                                event_descriptions: [],
                                                event_creator_names: []
                                            });
                                            this.GetPlannerInfo();
                                            event_list = this.renderEvents();
                                            }}>
                    </CreateEventDisplay>
                    {/*delete event button info*/}
                    <div>{event_list}</div>
                    <button className={"Event-Button"} style={float_left} onClick={() =>{
                        document.getElementById("create_event_modal").setAttribute("style", "display: block; z-index: 1;");
                        console.log(document.getElementById("create_event_modal"));
                    }}>
                        Create New Event
                    </button>
                </div>
            )
        }
    }

}

//Main
//Displays by default
class LoginController extends Component{
    constructor(props){
        super(props);
        this.state={
            /*change view indicators*/
            login: false,
            createAccount:false,
            loggedin: false,
            planner: false,

            /*current user info*/
            username : "",
            preferred_name: "",
            related_events : [],
            related_tables: [],
            table_names: [],
            password: "",
            verify_password: "",

            /*current planner info*/
            current_planner_id: null,

        };
        this.handleUser = this.handleUser.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
        this.handleLoginAccount = this.handleLoginAccount.bind(this);
        this.handleVerifyPassword = this.handleVerifyPassword.bind(this);
    }

    //updates username state value
    handleUser(event){
        this.setState({
           username: event.target.value,
        });
    }

    //updates password state value
    handlePassword(event){
        this.setState({
           password: event.target.value,
        });
    }

    //updates verify password state value
    handleVerifyPassword(event){
        this.setState({
           verify_password: event.target.value,
        });
    }

    //Create Account button pressed
    //Backend requires username and password params
    handleCreateAccount(){
        if(this.state.verify_password !== this.state.password){
            document.getElementById("Password-Match").innerHTML = "Passwords do not match";
            return;
        }
        let data = new URLSearchParams();
        data.append('username', this.state.username);
        data.append('password', this.state.password);

        const options = {
              method: 'post',
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
                 body: data,
            json: true,
        };
        fetch('http://127.0.0.1:5000/create_account' , options)
            .then(response =>{
                if(response.ok){
                    response.json().then(data => {
                        this.setState({
                            username: data.username,
                            preferred_name: data.preferred_name,
                            loggedin: true,
                        })
                    })
                }else{
                    //username already exists in database
                    if(response.status === 401)
                        document.getElementById("Password-Match").innerHTML = "Account already exists";
                }
            })
    }

    //Login button pressed
    //Backend requires username and password params
    handleLoginAccount(){
        let data = new URLSearchParams();
        data.append('username', this.state.username);
        data.append('password', this.state.password);

        const options = {
              method: 'post',
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
                 body: data,
            json: true,
        };
        fetch('http://127.0.0.1:5000/login_account' , options)
            .then(response =>{
                if(response.ok){
                    response.json().then(data => {
                        this.setState({
                            username: data.user.username,
                            preferred_name: data.user.preferred_name,
                            related_tables: data.user.related_tables.split(','),
                            related_events: data.user.related_events.split(','),
                            table_names: data.user.table_names.split(','),
                            loggedin: true,
                        })
                    })
                }else{
                    //account is not found within database
                    if(response.status === 401)
                        document.getElementById("Account-Find").innerHTML = "Account not found";
                    //wrong password entry
                    if(response.status === 402)
                        document.getElementById("Account-Find").innerHTML = "Password does not match";

                }
            })
    }

    //user pressed "Create Account" button
    //renders a UI for account creation
    renderCreateField(){
        return(
            <div className={"Login-Box"}>
                <h1>Create Account</h1>
                <form>
                        <label>
                            Username
                            <input type={"text"} value={this.state.username} onChange={this.handleUser}/>
                        </label>
                </form>


                <form>
                        <label>
                            Password
                            <input type={"password"} value={this.state.password} onChange={this.handlePassword}/>
                        </label>

                    <br/>
                        <label>
                            Verify Password
                            <input type={"password"} value={this.state.verify_password} onChange={this.handleVerifyPassword}/>
                        </label>
                </form>


                <button onClick={this.handleCreateAccount}>
                    Create Account
                </button>
                <br/>
                <button onClick={() => this.setState({
                    login:true,
                    createAccount:false,
                })}>
                    Go To Login
                </button>
                {/* this div is modified when wrong password is entered */}
                <div id="Password-Match" className={"Password-No-Match"}>

                </div>
            </div>
        );
    }

    //Displayed by default
    //Displayed when "Login to account" is pressed
    //renders UI for user to login through
    renderLoginField(){
        return(
            <div className={"Login-Box"}>
                <h1>Login</h1>
                <form>
                        <label>
                            Username
                            <input type={"text"} value={this.state.username} onChange={this.handleUser}/>
                        </label>
                </form>
                <br/>

                <form>
                        <label>
                            Password.
                            <input type={"password"} value={this.state.password} onChange={this.handlePassword}/>
                        </label>
                </form>
                <br/>

                <button onClick={this.handleLoginAccount}>
                    Login
                </button>
                <br/>
                <button onClick={ () => this.setState({
                    login: false,
                    createAccount: true
                })}>
                    Go To Create Account
                </button>
                <div id="Account-Find" className={"Password-No-Match"}>

                </div>
            </div>
        );
    }

    //Creates an access point for each planner user has access to
    renderPlannerList(n) {
        let list = [];

        for (let i = 0; i < n; i += 1) {
            list.push(
                //key "i" correlates to the way the planners are displayed to user
                <button key={i} data-key={i} onClick={()=> {
                    /*TODO: when pressed, swap views and start a loading screen*/
                    this.setState({
                        planner: true,
                        current_planner_id: i,
                    })
                }}>
                    {/*display title of tables, this is the only info we have so far*/}
                    {this.state.table_names[i]}

                    {i}
                </button>
            );
            list.push(
                <br />
            );
        }
        return list;
    }

    render(){
        //check if we are logged in yet or not
        if(!this.state.login && !this.state.createAccount){
            return(
                <div className={"Login-Box"}>
                    <br/>
                    <button onClick={() => {
                        this.setState({
                            login: true
                        })
                    }}>
                        Login
                    </button>
                    <br/>
                    <button onClick={() =>{
                        this.setState({
                            createAccount: true
                        })
                    }}>
                        Create Account
                    </button>
                </div>
            );
        }

        if(this.state.loggedin){
            if(this.state.planner){
                return(
                  <div>
                      <h1>
                          {/*passing in actual planner unique ID value for query*/} {/*use the onClickReturn function in child to return to parent*/}
                          <DisplayPlanner current_planner_id={this.state.related_tables[this.state.current_planner_id]}
                                          onClickReturn={() =>{this.setState({planner:false})}}
                                          current_user={this.state.username}/>
                      </h1>

                  </div>
                );
            }else {
                return (
                    <div className={"Login-Box"}>
                        <h1>
                            Hello, {this.state.username}. What would you like to do?
                        </h1>
                        <h2>Your planners</h2>
                        <div>
                            {this.renderPlannerList(this.state.related_tables.length)}
                        </div>
                    </div>
                );
            }
        }
        else if(this.state.createAccount) {
            return (
                <div>
                    <div>
                        {this.renderCreateField()}
                    </div>

                </div>
            );

        }else if(this.state.login){
            return(
              <div>
                  <div>{this.renderLoginField()}</div>
              </div>
            );
        }
    }
}

ReactDOM.render(
    <LoginController/>,
  document.getElementById('root')
);