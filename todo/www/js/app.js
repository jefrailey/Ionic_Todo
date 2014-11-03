angular.module("todo", ["ionic"])

.factory("Projects", function() {
  return {
    all: function() {
      var projectString = window.localStorage["projects"];
      if (projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage["projects"] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage["lastActiveProject"]) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage["lastActiveProject"] = index;
    }
  };
})

.controller("TodoCtrl", function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  };

  // Load or initialize projects
  $scope.projects = Projects.all();

  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt("Project name");
    if (projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create and load the Modal
  $ionicModal.fromTemplateUrl("new-task.html", function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope,
  });

  // Called when the form is submitted
  $scope.createTask = function(task) {
    if (!$scope.activeProject || !task){
      return;
    }
    $scope.activeProject.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    task.title= "";
  };

  // Open the new task modal
  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  // Close the new task modal
  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.editProject = function(projectIndex) {
    var newProjectName = prompt("Enter the new project name");
    if (newProjectName) {
      $scope.projects[projectIndex].title = newProjectName;

      // Inefficient, but save all the projects
      Projects.save($scope.projects);
    }
  };

  $scope.deleteProject = function(projectIndex) {
    projectIsActiveProject = $scope.activeProject === $scope.projects[projectIndex];
    before = $scope.projects.slice(0, projectIndex);
    after = $scope.projects.slice(projectIndex+1, $scope.projects.slice.length+1);
    $scope.projects = before.concat(after);

    // Inefficient, but save all the projects
    Projects.save($scope.projects);

    // Prompt new project creation if last project is deleted
    if (projectIsActiveProject) {
      if ($scope.projects.length) {
        $scope.activeProject = $scope.projects[0];
        console.log("inside if");
        console.log($scope.projects);
      }
      else {
        while (!$scope.projects.length) {
          $scope.newProject();
          console.log("inside else");
          console.log($scope.projects);
        }
      }
    }
  };

  $scope.editTask = function(project, taskIndex) {
    var newTaskName = prompt("Enter the new task name");
    if (newTaskName) {
      project.tasks[taskIndex].title = newTaskName;

      // Inefficient, but save all the projects
      Projects.save($scope.projects);
    }
  };

  $scope.deleteTask = function(project, taskIndex) {
    before = project.tasks.slice(0, taskIndex);
    after = project.tasks.slice(taskIndex+1, project.tasks.length+1);
    project.tasks = before.concat(after);
    Projects.save($scope.projects);
  };

  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if (!$scope.projects.length) {
      while (true) {
        var projectTitle = prompt("Your first project title:");
        if (projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});
