import React, { Component } from 'react';
import axios from 'axios';
import FormContainer from './FormContainer';

const API = 'http://localhost:4000/users/readAll';
const DEFAULT_QUERY = '';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Yzc2ZGE2YWRjNzdlYTM0Y2QwZDAxNTQiLCJpYXQiOjE1NTEzNjQ4MTV9.X6hIzF3Pz-H6c2J9T387Ob_qixGhJjNmFK3641tPDhk';
const allowed_fields = [
    "username",
    "email",
    "id",
    "_id",
    "role",
    "roles"
]

function RenderUser (props) {
    let user_keys = Object.keys(props.input).filter(item => {
        if( allowed_fields.includes(item)) {
            return item;
        }
        return undefined;
    });
    let user_list = user_keys.map(key => {
        if ( key !== 'role' ) {
        return ( <th>{props.input[key]} </th> );
         } 
         else {
             return (<th>{JSON.stringify(props.input[key])}</th> ) ;
         }
    }
    );
    return user_list;
}

function TableHeader (props) {
    let user_keys = Object.keys(props.input).filter(item => {
        if( allowed_fields.includes(item) ) {
            return item;
        }
        return undefined;
    });
    user_keys = user_keys.map(key => 
        <th>{key}</th>);
    return user_keys;
}

class ReadAll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            isLoading: false,
            error: null,
        };
    }

    handleClick = () => {

        this.setState({ isLoading: true });
        var info;
        axios.get(API + DEFAULT_QUERY, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then(
                result => {
                    info = result.data.map((item, index) => {
                        return ( <tr>
                            <RenderUser input={item} />
                        </tr> );
                    });
                    let header = <tr> <TableHeader input={result.data[0]} /> </tr> ;
                    this.setState({
                        data: info,
                        header: header,
                        isLoading: false
                    })
                }
            )
            .catch(error => this.setState({
                error,
                isLoading: false
            }));
    }

    render() {
        var arr = this.state.data;
        return (
            <div>
                <button onClick={this.handleClick}>
                Click me
                </button>
                <FormContainer />
                <table>
                {this.state.header}
                {arr}
            </table>
            </div>
        );
    }
}

export default ReadAll;