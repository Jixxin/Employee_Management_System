const inquirer = require('inquirer')
const mysql = require('mySQL2')

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Jovie322948$',
        database: 'employee_db',
    },
    console.log('Connected to the employee_db database.')
);
console.log("")
console.log("Welcome to my Employee Management System!")
console.log("")
appStart();

function appStart() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'View All Departments', 'View All Roles', 'Add an Employee', 'Add a Department', 'Add a Role', 'Update an Employee Role', 'Exit'],
            name: 'menu'
        }
    ]).then(ans => {
        if (ans.menu === 'View All Employees') {
            viewEmployees()
        } else if (ans.menu === 'View All Departments') {
            viewDepartments()
        } else if (ans.menu === 'View All Roles') {
            viewRoles()
        } else if (ans.menu === 'Add an Employee') {
            addEmployee()
        } else if (ans.menu === 'Add a Department') {
            addDepartment()
        } else if (ans.menu === 'Add a Role') {
            addRole()
        } else if (ans.menu === 'Update an Employee Role') {
            updateEmployee()
        } else {
            process.exit()
        }
    })
}

const getRoles = () => {
    return new Promise((resolve, reject) => {
        var roleArr = [];
        db.query('SELECT * FROM role', (err, data) => {
            if (err) reject(err);
            for (let i = 0; i < data.length; i++) {
                roleArr.push(data[i].title);
            }
            resolve(roleArr);
        })
    })
}

const getEmployees = () => {
    return new Promise((resolve, reject) => {
        var empArr = [];
        db.query('SELECT * FROM employee', (err, data) => {
            if (err) reject(err);
            for (let i = 0; i < data.length; i++) {
                empArr.push(data[i].first_name + ' ' + data[i].last_name);
            }
            resolve(empArr);
        })
    })
}

const getDepartments = () => {
    return new Promise((resolve, reject) => {
        var departArr = [];
        db.query('SELECT * FROM department', (err, data) => {
            if (err) reject(err);
            for (let i = 0; i < data.length; i++) {
                departArr.push(data[i].name);
            }
            resolve(departArr);
        })
    })
}

const getRoleId = (input) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM role WHERE title = (?)', [input], (err, ans) => {
            if (err) reject(err);
            const newRoleId = ans[0].id;
            resolve(newRoleId);
        })
    })
}

const getEmployeeId = (input) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM employee WHERE first_name = (?) AND last_name = (?)', [input.split(" ")[0], input.split(" ")[1]], (err, ans) => {
            if (err) reject(err);
            const newEmpId = ans[0].id;
            resolve(newEmpId);
        })
    })
}

const getDepartmentId = (input) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id FROM department WHERE name = (?)', [input], (err, ans) => {
            if (err) reject(err);
            const newDeptId = ans[0].id;
            resolve(newDeptId);
        })
    })
}

const viewEmployees = () => {
    const selection = 'SELECT a.id AS ID, CONCAT(a.first_name, " ", a.last_name) AS Employee, role.title AS Title, department.name AS Department, role.salary AS Salary, IFNULL(CONCAT(b.first_name, " ", b.last_name),"[None]") AS Manager FROM employee a LEFT JOIN employee b ON b.id = a.manager_id JOIN role ON a.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY a.id'
    db.query(selection, function (err, results) {
        if (err) {
            throw err;
        } else {
            console.table(results);
            appStart();
        }
    })

}
const viewDepartments = () => {
    const selection = 'SELECT department.id AS ID, department.name AS Department FROM department';
    db.query(selection, function (err, results) {
        if (err) {
            throw err;
        } else {
            console.table(results);
            appStart();
        }
    })
}

const viewRoles = () => {
    const selection = 'SELECT role.id AS ID, role.title AS Title, department.name AS Department, role.salary AS Salary FROM role JOIN department ON role.department_id = department.id ORDER BY role.id'
    db.query(selection, function (err, results) {
        if (err) {
            throw err;
        } else {
            console.table(results);
            appStart();
        }
    })
}

async function addEmployee() {
    try {
        const roleList = await getRoles();
        const employeeList = await getEmployees();
        const ans = await inquirer.prompt([
            {
                type: 'input',
                message: 'What is the employees first name?',
                name: 'newFirst',
            }, {
                type: 'input',
                message: 'What is the employees last name?',
                name: 'newLast',
            }, {
                type: 'list',
                message: 'What is their role?',
                choices: roleList,
                name: 'newRole',
            }, {
                type: 'list',
                message: 'Who is their manager?',
                choices: employeeList,
                name: 'newManager',
            }
        ])
        const newRoleId = await getRoleId(ans.newRole);
        const newManagerId = await getEmployeeId(ans.newManager);
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [ans.newFirst, ans.newLast, newRoleId, newManagerId], (err, ans) => {
            if (err) throw err;
            console.log("The new employee has successfully been added.");
            appStart();
        })
    }
    catch (err) {
        console.log(err);
        appStart();
    }
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new department?',
            name: 'newDepartment',
        }
    ]).then(ans => {
        const input = ans.newDepartment;
        db.query('INSERT INTO department (name) VALUES (?)', input, (err, data) => {
            if (err) {
                throw err;
            }
            console.log("Successfully added " + ans.newDepartment + " as a new department.");
            appStart();
        })
    })
}

async function addRole() {
    try {
        const deptList = await getDepartments();
        const ans = await inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name of the new role?',
                name: 'newRole',
            }, {
                type: 'input',
                message: 'What is the salary?',
                name: 'newRoleSalary'
            }, {
                type: 'list',
                message: 'What department is it in?',
                choices: deptList,
                name: 'newRoleDepart',
            }
        ])
        const newDeptId = await getDepartmentId(ans.newRoleDepart);
        db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [ans.newRole, ans.newRoleSalary, newDeptId], (err, ans) => {
            if (err) throw err;
            console.log("The new role has successfully been added.");
            appStart();
        })
    }
    catch (err) {
        console.log(err);
        appStart();
    }
}

async function updateEmployee() {
    try {
        const employeeList = await getEmployees();
        const roleList = await getRoles();
        const ans = await inquirer.prompt([
            {
                type: 'list',
                message: 'Which employees role would you like to update?',
                choices: employeeList,
                name: 'chosenEmployee'
            }, {
                type: 'list',
                message: 'What is their new role?',
                choices: roleList,
                name: 'newRole'
            }
        ])
        const empId = await getEmployeeId(ans.chosenEmployee);
        const newRole = await getRoleId(ans.newRole);
        db.query('UPDATE employee SET role_id = (?) WHERE id = (?)', [newRole, empId], (err, ans) => {
            if (err) throw err;
            console.log("Employee's role has successfully been updated.");
            appStart();
        })
    }
    catch (err) {
        console.log(err);
        appStart();
    }
}