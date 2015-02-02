/** @jsx React.DOM */
var React = require('react');

var BootstrapButton = React.createClass({
	render: function() {
		return (
			<a {...this.props}
			href="javascript:;"
			role="button"
			className={(this.props.className || '') + ' btn'} />
		);
	}
});

var Input = React.createClass({
	handleSubmit: function(){
		console.log('handling submit!');
	},
	render: function(){
		var divStyle = {
			marginBottom: 10
		};

		var submitButton;
		submitButton = (
			<BootstrapButton onClick={this.handleSubmit} className="btn-default">
			{this.props.submit}
			</BootstrapButton>
		);

		return (
			<div>
			<input type="text" className="form-control" style={divStyle}></input>
			{submitButton}
			</div>
		);
	}
});

module.exports = Input;