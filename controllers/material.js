const db = require('../config/dbconnection');

const addMaterial = async (req, res) => {
  if(req.user.role != "User"){
    return res.json("you are not user")}
    try {
     
      const { nameofmaterial, project_title } = req.body;
      const user_id = req.user.user_id; 
      const user_role = req.user.role;
  
     if (user_role !== "User") {
        return res.status(403).json({ error: "You are not authorized to add material" });
      }
  db.query(
        'SELECT * FROM material WHERE nameofmaterial = ? AND user_id = ? AND project_title = ?',
        [nameofmaterial, user_id, project_title],
        async (error, results) => {
          if (error) {
            console.error('Error executing SELECT query:', error);
            return res.status(500).json({ success: false, error: 'An error occurred while checking material existence' });
          }
  
          if (results && results.length > 0) {
            db.query(
              'UPDATE material SET quantity = quantity + 1 WHERE nameofmaterial = ? AND user_id = ? AND project_title = ?',
              [nameofmaterial, user_id, project_title],
              (error, results) => {
                if (error) {
                  console.error('Error executing UPDATE query:', error);
                  return res.status(500).json({ success: false, error: 'An error occurred while updating material quantity' });
                }
                res.status(201).json({ success: true, message: 'Material quantity updated successfully' });
              }
            );
          } else {
            db.query(
             ' INSERT INTO material (nameofmaterial, quantity, user_id, project_title, date_added) VALUES (?, 1, ?, ?, CURDATE())',
              [nameofmaterial, user_id, project_title],
              (error, results) => {
                if (error) {
                  console.error('Error executing INSERT query:', error);
                  return res.status(500).json({ success: false, error: 'An error occurred while adding material' });
                }
                res.status(201).json({ success: true, message: 'Material added successfully' });
              }
            );
          }
        }
      );
    } catch (error) {
      console.error('Error adding material:', error);
      res.status(500).json({ success: false, error: 'An error occurred while adding material' });
    }
  };


const getYourMaterial  = async (req, res) => {
  if(req.user.role != "User"){
    return res.json("you are not user")}
    try {
        const user_id = req.user.user_id; 
       
        db.query(
           ' SELECT * FROM material WHERE user_id = ?',
            [user_id],
            (error, results) => {
                if (error) {
                    console.error('Error executing SELECT query:', error);
                    return res.status(500).json({ success: false, error: 'An error occurred while retrieving materials' });
                }
               res.status(200).json({ success: true, message: 'These are the materials that you have added:', materials: results });

            }

        );
    } catch (error) {
        console.error('Error retrieving materials:', error);
        res.status(500).json({ success: false, error: 'An error occurred while retrieving materials' });
    }
};


const deleteYourMaterial = async (req, res) => {
  if(req.user.role != "User"){
    return res.json("you are not user")}
    try {
        const user_id = req.user.user_id; 
        const { nameofmaterial, project_title } = req.body;
 db.query(
           ' SELECT * FROM material WHERE nameofmaterial = ? AND project_title = ? AND user_id = ?',
            [nameofmaterial, project_title, user_id],
            (error, materials) => {
                if (error) {
                    console.error('Error executing SELECT query:', error);
                    return res.status(500).json({ success: false, error: 'An error occurred while retrieving material' });
                }
                
                if (!materials || materials.length === 0) {
                    return res.status(404).json({ success: false, error: 'Material not found or does not belong to the user' });
                }

                if (materials.length === 1 && materials[0].quantity === 1) {
                   db.query(
                       ' DELETE FROM material WHERE nameofmaterial = ? AND project_title = ? AND user_id = ?',
                        [nameofmaterial, project_title, user_id],
                        (error, results) => {
                            if (error) {
                                console.error('Error executing DELETE query:', error);
                                return res.status(500).json({ success: false, error: 'An error occurred while deleting material' });
                            }
                            res.status(200).json({ success: true, message: 'Material deleted successfully' });
                        }
                    );
                } else {
                    db.query(
                    '    UPDATE material SET quantity = quantity - 1 WHERE nameofmaterial = ? AND project_title = ? AND user_id = ? LIMIT 1',
                        [nameofmaterial, project_title, user_id],
                        (error, results) => {
                            if (error) {
                                console.error('Error executing UPDATE query:', error);
                                return res.status(500).json({ success: false, error: 'An error occurred while updating material quantity' });
                            }
                            res.status(200).json({ success: true, message: 'Material quantity decremented successfully' });
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ success: false, error: 'An error occurred while deleting material' });
    }
};


const showavailablematerial = async (req, res) => {
  if(req.user.role != "User"){
    return res.json("you are not user")}
  try {
    const loggedInUserId = req.user.user_id; 

    const userEmailQuery = 'SELECT email FROM users WHERE user_id = ?';
    db.query(userEmailQuery, [loggedInUserId], (error, userResult) => {
      if (error) {
        console.error('Error executing user email SELECT query:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while retrieving the user email' });
      }

      if (userResult.length === 0) {
        return res.status(404).json({ success: false, error: 'User email not found' });
      }

      const loggedInUserEmail = userResult[0].email;

      
      const projectsQuery = `
        SELECT p.title FROM project p
        JOIN user_project up ON p.project_id = up.project_id
        WHERE up.user_id = ? AND up.status = 'Active'`;

      db.query(projectsQuery, [loggedInUserId], (error, projects) => {
        if (error) {
          console.error('Error executing projects SELECT query:', error);
          return res.status(500).json({ success: false, error: 'An error occurred while retrieving projects' });
        }

        if (projects.length === 0) {
          return res.status(404).json({ success: false, error: 'User has no active associated projects' });
        }

        const projectTitles = projects.map(project => project.title);

        const placeholders = projectTitles.map(() => '?').join(', ');

        const materialsQuery = `
          SELECT m.nameofmaterial, m.quantity, u.email, u.user_id 
          FROM material m
          JOIN users u ON m.user_id = u.user_id
          WHERE m.project_title IN (${placeholders})`;

        db.query(materialsQuery, projectTitles, (error, materials) => {
          if (error) {
            console.error('Error executing materials SELECT query:', error);
            return res.status(500).json({ success: false, error: 'An error occurred while retrieving materials' });
          }

          if (materials.length === 0) {
            return res.status(404).json({ success: false, error: 'No materials found for the user\'s projects' });
          }
const materialsWithOwnership = materials.map(material => ({
            ...material,
            isUserMaterial: material.email === loggedInUserEmail,
            ownershipMessage: material.email === loggedInUserEmail ? 'This is your material' : 'Material added by another user'
          }));

          res.status(200).json({ success: true, materials: materialsWithOwnership });
        });
      });
    });
  } catch (error) {
    console.error('Catch block error retrieving materials:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred while retrieving materials' });
  }
};



const buyMaterial = async (req, res) => {
  try {
    const loggedInUserId = req.user.user_id;
    const { nameofmaterial, project_title, email } = req.body; 
   const checkUserMaterialQuery = 'SELECT material FROM users WHERE user_id = ${loggedInUserId}';

    db.query(checkUserMaterialQuery, async (err, userMaterialsResult) => {
      if (err) {
        console.error('Error fetching user materials:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      }
      
      const userMaterials = userMaterialsResult[0].material.split(',');
      if (userMaterials.includes(nameofmaterial)) {
        return res.json({ message: "You already have this material" });
      }
 const userProjectQuery = `
        SELECT up.project_id
        FROM user_project up
        WHERE up.user_id = ?`;

      db.query(userProjectQuery, [loggedInUserId], async (error, projectResult) => {
        if (error) {
          console.error('Error fetching user project:', error);
          return res.status(500).json({ success: false, error: 'An error occurred while fetching user project' });
        }

        if (projectResult.length === 0) {
          return res.status(400).json({ success: false, error: 'You are not associated with any project' });
        }

        const projectId = projectResult[0].project_id;
         const projectTitleQuery = `
          SELECT p.title
          FROM project p
          WHERE p.project_id = ?`;

        db.query(projectTitleQuery, [projectId], async (error, projectTitleResult) => {
          if (error) {
            console.error('Error fetching project title:', error);
            return res.status(500).json({ success: false, error: 'An error occurred while fetching project title' });
          }

          if (projectTitleResult.length === 0) {
            return res.status(400).json({ success: false, error: 'Project title not found' });
          }

          if (fetchedProjectTitle !== project_title) {
            return res.status(400).json({ success: false, error: 'You are not associated with the specified project' });
          }
           const checkMaterialQuery = `
            SELECT quantity FROM material
            WHERE nameofmaterial = ? AND project_title = ?`; 

          db.query(checkMaterialQuery, [nameofmaterial, project_title], async (error, quantityResult) => {
            if (error) {
              console.error('Error checking material existence:', error);
              return res.status(500).json({ success: false, error: 'An error occurred while checking material existence' });
            }

            if (quantityResult.length === 0) {
              return res.status(404).json({ success: false, error: 'Material not found for the specified project title' });
            }

            const materialQuantity = quantityResult[0].quantity;

            let message = '';
            let actionQuery;

            if (materialQuantity === 1) {
              message = 'This is the last one, This material is for you.';
              
              actionQuery = `
                DELETE FROM material
                WHERE nameofmaterial = ? AND project_title = ?`; 
            } else {
              message = 'Material purchased successfully, This material is for you.';
              actionQuery = `
                UPDATE material
                SET quantity = quantity - 1
                WHERE nameofmaterial = ? AND project_title = ?`; 
            }

            db.query(actionQuery, [nameofmaterial, project_title], async (error, updateResult) => {
              if (error) {
                console.error('Error updating material quantity:', error);
                return res.status(500).json({ success: false, error: 'An error occurred while updating material quantity' });
              }
                  const addMaterialToUserQuery = `
                UPDATE users
                SET material = CONCAT(IFNULL(material, ''), ?, ', ')
                WHERE user_id = ?`;

              db.query(addMaterialToUserQuery, [nameofmaterial, loggedInUserId], async (error, addMaterialResult) => {
                if (error) {
                  console.error('Error adding material to user:', error);
                  return res.status(500).json({ success: false, error: 'An error occurred while adding material to user' });
                }

                res.status(200).json({ success: true, message });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Catch block error:', error);
    res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  }
};

module.exports = {
  addMaterial,
  getYourMaterial,
  deleteYourMaterial,
  showavailablematerial,
  buyMaterial
 
};