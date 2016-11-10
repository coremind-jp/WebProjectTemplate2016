interface Person {
	firstname: string;
	lastname: string;
}

function greeter(person: Person) {
	return "Hello, " + person.firstname + " " + person.lastname;
}

var user = { firstname: "jane", lastname: "User" };

document.getElementById('content').innerHTML = greeter(user);