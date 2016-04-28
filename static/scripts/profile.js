var SaveAboutInfo = function() {
	var name = document.getElementsByName('name')[0].value;
	var surname = document.getElementsByName('surname')[0].value;
	var surname = document.getElementsByName('surname')[0].value;
	var phone = document.getElementsByName('phone')[0].value;
	var position = document.getElementsByName('position')[0].value;
	var about = document.getElementsByName('about')[0].value;

	$.post('/profile/change/info', {
		name : name, 
		surname : surname, 
		phone : phone, 
		position : position, 
		about : about
	}, function(res) {
		alert(res);
	});
}

var ChangePassword = function() {
	var currentPassword = document.getElementsByName('current')[0].value;
	var newPassword = document.getElementsByName('new')[0].value;
	var retypeNewPassword = document.getElementsByName('new_retype')[0].value;

	if (newPassword == retypeNewPassword) {
		$.post('/profile/change/password', {
			current : currentPassword,
			new : newPassword
		}, function(error) {
			if (error.redirect) {
				window.location.href = error.redirect;
			} else {
				alert(error);
			}
		});
	} else {
		alert("Пароли не совпадают!");
	}
}