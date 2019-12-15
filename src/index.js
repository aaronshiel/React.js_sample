import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './App.css'

class DisplayPlanner extends Component{
    constructor(props){
        super(props);

        this.state={
            /*TODO: current_planner_id is already known through props*/
            current_planner_id : null,
            title: null,
            related_events: null,
        };
    }
    /*create method for parent to add new event*/

    /*TODO: on call, run query with passed in ID*/
    componentDidMount() {

    }

    render(){
        return(
          <div>
              Hello
          </div>
        );

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
            password : "",

            /*current planner info*/
            current_planner_id: null,

        };
        this.handleUser = this.handleUser.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
        this.handleLoginAccount = this.handleLoginAccount.bind(this);
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

    handleCreateAccount(){
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
                    response.json().then(data =>{
                        console.log(data);
                    })
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
                    response.json().then(data =>{
                        console.log(data);
                    })
                }
            })
    }

    renderCreateField(){
        return(
            <div>
                <h1>Create Account</h1>
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
                            <input type={"text"} value={this.state.password} onChange={this.handlePassword}/>
                        </label>
                </form>
                <br/>

                <button onClick={this.handleCreateAccount}>
                    Create Account
                </button>
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
                            <input type={"text"} value={this.state.password} onChange={this.handlePassword}/>
                        </label>
                </form>
                <br/>

                <button onClick={this.handleLoginAccount}>
                    Login
                </button>
            </div>
        );
    }

    renderPlannerList(n) {
        let list = [];

        for (let i = 0; i < n; i += 1) {
            list.push(
                <button key={i} onClick={()=> {
                    /*TODO: when pressed, swap views and start a loading screen*/
                    this.setState({
                        planner: true,
                    })
                }}>
                    {/*display title of tables, this is the only info we have so far*/}
                    {this.state.table_names[i]}
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
                <div>
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
                          <DisplayPlanner />
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
                    <div>{this.renderCreateField()}</div>
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