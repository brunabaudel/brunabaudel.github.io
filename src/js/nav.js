function showView(viewId) {
  // Hide all views
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active-view");
  }

  // Show the selected view
  var selectedView = document.getElementById(viewId);
  if (selectedView) {
    selectedView.classList.add("active-view");
  }

  // Update the active menu item
  var menuItems = document.querySelectorAll(".nav-menu li");
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].classList.remove("active");
  }
  var activeMenuItem = document.querySelector(
    `.nav-menu li a[href="#${viewId}"]`
  );
  if (activeMenuItem) {
    activeMenuItem.parentElement.classList.add("active");
  }
}
