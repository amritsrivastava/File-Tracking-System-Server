<!-- prettier-ignore -->

 # File Tracking System Server

This is the server of File Tracking System implemented for the Smart India Hackathon 2020.

# Table of Contents

- [Requirements](#requirements)
- [Basic Installation](#basic-installation)

  - [Installing Node.js](#installing-nodejs)
  - [Installing Yarn](#installing-yarn)

- [Project Installation](#project-installation)

- [Contributing Guidelines](#contributing-guidelines)

- [Branch Name Instructions](#branch-name-instructions)

- [APIs Testing Instructions](#apis-testing-instructions)

  # Requirements

- Node.js

- MongoDB

# Basic Installation

## Installing Node.js

You can find installation instructions according to your system at [Download Node.js](https://nodejs.org/en/download/)

## Installing MongoDB

You can find installation instructions according to your system at [Install MongoDB](https://docs.mongodb.com/v3.2/administration/install-community/)

# Project Installation

1. Clone the repository

    1. Click on `Clone or Download` button and copy the link.
    2. If you have configured `ssh` you can copy SSH Link by clicking on `ssh` and then copy.
    3. Clone the repository:

        ```bash
        $git clone https://github.com/amritsrivastava/file-tracking-system-server
        ```

    4. This will create a new folder named `file-tracking-system-server`

2. Change current working directory to this new folder:

    ```bash
    $cd file-tracking-system-server
    ```

3. Now install dependencies using `npm install`.

4. After installation, you can run server by `npm start`

5. Your server is running at Secure port : <http://localhost:3443>, Unsecured port : <http://localhost:3000>.

6. You can start editing code in your favorite editor.

7. That's it.

# Contributing Guidelines

The contribution will follow typical git-fork workflow. You can use following steps to keep yourself away from any unwanted pushes to main repository and from git conflicts.

1. Clone the repository (see above [instructions](#project-installation))
2. Before starting the development:

    1. pull latest changes from origin by using:

        ```bash
        $git pull origin master
        ```

    2. Create a new branch(if not exists) for every feature you work on. (Please follow these [instructions](#branch-name-instructions) for naming branches): For example

        ```bash
        $git checkout -b branchName
        ```

    3. Do regular commits. For one commit, only include files that are changed for only that commit. You can do multiple commits for a feature. Follow these instructions for a [good commit message](https://www.conventionalcommits.org/en/v1.0.0/#summary).

3. After development:

    1. Push your changes to the new branch on origin:

        ```bash
        $git push origin branchName #this is same branchName you created in step 2.2
        ```

    2. Create a pull request. You will see a `compare and pull request` option as soon as you push your changes.

# Branch Name Instructions

You can keep any branch name you want but as a team, there may be a situation where branch names conflict within team members.

To avoid this situation, we will use branch name like following:

> username/featureName

Now multiple members can have same branch names but different because of username.

# APIs Testing Instructions

1. Use this IP for calling APIs [https://13.233.200.7:3443](https://13.233.200.7:3443)
2. Admin account details :

    ```
    {
      "email": "admin@gmail.com",
      "password": "password"
    }
    ```
