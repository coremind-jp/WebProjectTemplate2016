var CommentBox = React.createClass({
	getInitialState: function() {
		return { data: [] }
	},
	render: function() {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={ this.state.data } />
				<CommentForm onCommentSubmit={ this.handleSubmit } />
			</div>
		);
	},
	componentDidMount: function() {
		this.loadCommentsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: "json",
			cache: false,
			success: function(data) {
				this.setState({ data: data });
			}.bind(this),
			error: function(xhr, status, error) {
				console.error(this.props.url, status, error.toString());
			}.bind(this)
		});
	},
	handleSubmit: function(comment)
	{
		var comments = this.state.data;
		var newComments = comments.concat([comment]);
		this.setState({ data: newComments });

		$.ajax({
			url: this.props.url,
			dataType: "json",
			type: "POST",
			data: comment,
			success: function(response) {
				this.setState({ data: response });
			}.bind(this),
			error: function(xhr, status, error) {
				console.error(this.props.url, status, error.toString());
			}.bind(this)
		});
	}
});

var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.data.map(function(comment) {
			return (
				<Comment author={ comment.author }>
					{ comment.text }
				</Comment>
			);
		});
		return (
			<div className="commentList">
				{ commentNodes }
			</div>
		);
	}
});

var Comment = React.createClass({
	render: function() {
		var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{ this.props.author }
				</h2>
				<span dangerouslySetInnerHTML={{ __html: rawMarkup }} />
			</div>
		);
	}
});

var CommentForm = React.createClass({
	render: function() {
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input type="text" ref="author" placeholder="Your name" />
				<input type="text" ref="text" placeholder="Say something..." />
				<input type="submit" value="Post" />
			</form>
		);
	},
	handleSubmit: function(e) {
		e.preventDefault();

		var author = React.findDOMNode(this.refs.author).value.trim();
		var text   = React.findDOMNode(this.refs.text).value.trim();

		if (!text || !author) return;

		React.findDOMNode(this.refs.author).value = "";
		React.findDOMNode(this.refs.text).value = "";
		this.props.onCommentSubmit({ author: author, text: text });
	}
});

React.render(
	<CommentBox
		url="http://localhost:80/"
		pollInterval={ 2000 } />,
	document.getElementById('content')
);