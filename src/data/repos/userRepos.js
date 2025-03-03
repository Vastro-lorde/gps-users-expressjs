const { getDuration } = require("../../utils/others");
const db = require("../database");

exports.createUserRepo = async ({ name, email, latitude, longitude }) => {
  const query = `INSERT INTO users (name, email, latitude, longitude) VALUES (?, ?, ?, ?)`;
  const params = [name, email, latitude, longitude];

  params.forEach((param) => {
    if (typeof param !== "string" && typeof param !== "number") {
      throw new Error("Invalid parameter type");
    }
    param = param.toString().replace(/[^\w\s]/gi, '');
  });

  return new Promise((resolve, reject) => { 
    const start = Date.now();
    db.run(query, params, function (err) {
      const duration = getDuration(start);

      if (err) {
        reject(err); // Pass the error to the caller
      } else {
        resolve({ id: this.lastID, duration }); // Return the new record's ID and query duration
      }
    });
  });
};


exports.getAllUsersRepo = ({ page, limit }) => {
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM users LIMIT ? OFFSET ?`;
    const start = Date.now();
  
    return new Promise((resolve, reject) => {
      db.all(query, [limit, offset], (err, rows) => {
        const duration = getDuration(start);
  
        if (err) {
          reject(new Error(`Database Error: ${err.message}`));
        } else {
          resolve({ users: rows, duration });
        }
      });
    });
};


exports.findUsersNearLocationRepo = ({ latitude, longitude, radius = 5 }) => {
  const earthRadiusKm = 6371;
  const radiusInDegrees = radius / earthRadiusKm;

  const query = `
    WITH location AS (
      SELECT ? AS lat, ? AS lng, ? AS radius
    )
    SELECT * FROM (
      SELECT *, 
            (6371 * ACOS(
                COS(lat * PI() / 180) * COS(latitude * PI() / 180) * 
                COS((longitude - lng) * PI() / 180) + 
                SIN(lat * PI() / 180) * SIN(latitude * PI() / 180)
            )) AS distance
      FROM users, location
      WHERE latitude BETWEEN (lat - (radius / 111)) AND (lat + (radius / 111))
      AND longitude BETWEEN (lng - (radius / (111 * COS(lat * PI() / 180)))) 
                          AND (lng + (radius / (111 * COS(lat * PI() / 180))))
    ) AS subquery
    WHERE distance <= radius
    ORDER BY distance ASC;
  `;

  const start = Date.now();

  return new Promise((resolve, reject) => {
    db.all(query, [latitude, longitude, radius], (err, rows) => {
      const duration = getDuration(start);

      if (err) {
        reject(new Error(`Database Error: ${err.message}`));
      } else {
        resolve({ users: rows, duration });
      }
    });
  });
};
