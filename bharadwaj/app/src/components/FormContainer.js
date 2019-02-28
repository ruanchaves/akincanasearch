import React, { Component } from 'react';
import Cookies from 'universal-cookie';

class FormContainer extends Component {
    constructor() {
        super()
        this.state = {
            formControls: {
                name: {
                    value: ''
                },
                password: {
                    value: ''
                }
            }
        }
    }

    changeHandler = event => {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            formControls: {
                [name]: value
            }
        });

    }

    render() {
        return (
            <form>
                <input type="text"
                    name="name"
                    value={this.state.formControls.name.value}
                    onChange={this.changeHandler} />
                <input type="password"
                    name="password"
                    value={this.state.formControls.password.value}
                    onChange={this.changeHandler} />
            </form>
        );
    }
}

export default FormContainer;