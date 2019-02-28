import React, { Component } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/users/readAll';
const DEFAULT_QUERY = '';
const token = '';

class ReadAll extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: null,
            isLoading: false,
            error: null,
        };
    }

    componentDidMount() {

        this.setState({isLoading: true});

        axios.get(API + DEFAULT_QUERY, {
            headers: {
                Authorization: 'Bearer' + token
            }
        })
            .then(result => this.setState({
                data: result.data,
                isLoading: false
            }))
            .catch(error => this.setState({
                error,
                isLoading: false
            }));
    }

    render() {
        return (
            <div>
                {data}
            </div>
        );
    }
}

export default ReadAll;