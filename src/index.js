import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'

class DisplayPlanner extends Component{
    constructor(props){
        super(props);

        this.state={
            /*TODO: current_planner_id is already known through props*/
            loading:true,
            creator_name: null,
            members_allowed: null,
            password: null,
            related_events: null,
            title: null,
            current_planner_id : this.props.current_planner_id,

            event_names: [],
            event_dates: [],
            event_descriptions: [],
            event_creator_names: [],
        };

        this.GetPlannerInfo = this.GetPlannerInfo.bind(this);
        this.getEvents = this.getEvents.bind(this);
    }

    /*create method for parent to add new event*/
    GetPlannerInfo(){
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
                            loading:false,
                        })
                    })
                        .then(() =>
                            this.getEvents(this.state.related_events.length)
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

    //TODO: LEFT OFF HERE, just got all the events info gathered, now create event html's for all events *easy mode*
    getEvents(n){
        console.log(n);
        for(let i = 1; i < n; i += 1){
            console.log(i);
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
            fetch('http://127.0.0.1:5000/get_event_info' , options)
                .then(response =>{
                    let events = this.state.event_dates;
                    let descriptions = this.state.event_descriptions;
                    let names = this.state.event_creator_names;
                    if(response.ok){
                        response.json().then(data => {
                            this.setState({
                                event_dates: events.push(data.date),
                                event_descriptions: descriptions.push(data.description),
                                event_creator_names: names.push(data.creator_name),
                            })
                        })
                    }else{
                        //TODO: if eventID does not exist, do something
                        response.json().then(data =>{
                            console.log(data);
                        })
                    }
                });
        }
        console.log(this.state.event_descriptions);
    }


    render(){
        return(
            <div>
                hello
            </div>
        )

    }

}


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

    handleUser(event){
        this.setState({
           username: event.target.value,
        });
    }

    handlePassword(event){
        this.setState({
           password: event.target.value,
        });
    }

    handleVerifyPassword(event){
        this.setState({
           verify_password: event.target.value,
        });
    }

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
                        console.log(data);
                        this.setState({
                            username: data.username,
                            preferred_name: data.preferred_name,
                            loggedin: true,
                        })
                    })
                }else{
                    if(response.status === 401)
                        document.getElementById("Password-Match").innerHTML = "Account already exists";
                }
            })
    }

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
                        //console.log(this.state.username);
                    })
                }else{
                    if(response.status === 401)
                        document.getElementById("Account-Find").innerHTML = "Account not found";
                    if(response.status === 402)
                        document.getElementById("Account-Find").innerHTML = "Password does not match";

                }
            })
    }

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

                <div id="Password-Match" className={"Password-No-Match"}>

                </div>
            </div>
        );
    }

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

    //TODO: NewEvent/NewPlanner
    render(){
        //probably do a cache check method
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
                          {/*TODO: pass in actual planner unique ID value for query*/}
                          <DisplayPlanner current_planner_id={this.state.related_tables[this.state.current_planner_id]}/>
                      </h1>

                  </div>
                );
            }else {
                return (
                    <div>
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