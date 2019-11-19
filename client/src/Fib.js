import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        indexes: [],
        values: {},
        index: ''
    }

    componentDidMount = () => {
        this.fetchValues();
        this.fetchIndexes();
    }

    fetchValues = async () => {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    fetchIndexes = async () => {
        const indexes = await axios.get('/api/values/all');
        this.setState({ indexes: indexes.data });
    }

    renderSeenIndexes = () => {
        return this.state.indexes.map(({number}, i) => (
            <span key={i}> {number} </span>
        ));
    }

    renderCalculatedValues = () => {
        return Object.entries(this.state.values).map(([key, value]) => (
            <div key={key}>
                <strong>{key}</strong>
                <span> => </span>
                <span>{value}</span>
            </div>
        ));
    }

    handleChange = event => {
        this.setState({ index: event.target.value });
    }

    handleSubmit = async event => {
        event.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        });

        this.setState({ index: '' });
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input value={this.state.index} onChange={this.handleChange} type="text"/>
                    <button>Submit</button>
                </form>

                <div>
                    <h3>Previous indexes</h3>
                    {this.renderSeenIndexes()}
                </div>

                <div>
                    <h3>Calculated values</h3>
                    {this.renderCalculatedValues()}
                </div>
            </div>
        );
    }
}

export default Fib;