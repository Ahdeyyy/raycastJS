class vec3 {
  constructor(obj) {
    //x,y,z for position and r,g,b for colors
    this.x = this.r = obj.x;
    this.y = this.g = obj.y;
    this.z = this.b = obj.z;
  }
  //length of the vector
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  //length squared of the vector ,
  //admittedly the dot product of a vector with itself results in it
  length_squared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  static sum(a, b) {
    return new vec3({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  }

  static substract(a, b) {
    return new vec3({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  }
  //multiplies each element of each vector with its pair from the other vector
  static multiply(a, b) {
    return new vec3({ x: a.x * b.x, y: a.y * b.y, z: a.z * b.z });
  }

  static divide(a, b) {
    return new vec3({ x: a.x / b.x, y: a.y / b.y, z: a.z / b.z });
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  //scales a vector by a factor
  scale(f) {
    return new vec3({
      x: this.x * f,
      y: this.y * f,
      z: this.z * f,
    });
  }

  static cross(a, b) {
    return new vec3({
      x: a.y * b.z - a.z * b.y,
      y: -(a.x * b.z) - a.z * b.x,
      z: a.x * b.y - a.y * b.x,
    });
  }
  //vector with a length of 1
  static unit_vector(a) {
    return new vec3({
      x: a.x / a.length(),
      y: a.y / a.length(),
      z: a.z / a.length(),
    });
  }
}

//I can't figure out how to make rays work, I keep getting undefined for the origin and direction
class ray {
  A;
  B;
  ray(a, b) {
    this.A = new vec3({ x: a.x, y: a.y, z: a.z });
    this.B = new vec3({ x: b.x, y: b.y, z: b.z });
  }

  origin() {
    return this.A;
  }

  direction() {
    return this.B;
  }

  point_at(t) {
    return vec3.sum(this.A, this.B.scale(t));
  }
}
//point in sphere
function random_in_unit_sphere() {
  let p;
  do {
    p = vec3.substract(
      new vec3({
        x: Math.random() * Math.random() * Math.random(),
        y: Math.random() * Math.random() * Math.random(),
        z: Math.random() * Math.random() * Math.random(),
      }).scale(2),
      new vec3({ x: 1, y: 1, z: 1 })
    );
  } while (vec3.dot(p, p) >= 1);
  return p;
}

//checks if a ray hits a sphere
function hit_sphere(center, radius, origin, direction) {
  oc = vec3.substract(origin, center);
  a = vec3.dot(direction, direction);
  b = 2 * vec3.dot(oc, direction);
  c = vec3.dot(oc, oc) - radius * radius;
  d = b * b - 4 * a * c;
  if (d < 0) {
    return -1.0;
  } else {
    return (-b - Math.sqrt(d)) / (2 * a);
  }
}

//returns the color the ray points to

//small sphere
function color(dir, origin) {
  t = hit_sphere(new vec3({ x: 0, y: 0, z: -1 }), 0.5, origin, dir); //small sphere

  if (t > 0) {
    target = vec3.sum(
      vec3.sum(origin, dir.scale(t / 2)),
      random_in_unit_sphere()
    );
    N = vec3.unit_vector(
      vec3.substract(
        vec3.sum(origin, dir.scale(t)),
        new vec3({ x: -1, y: -1, z: -1 })
      )
    );
    target = vec3.sum(target, N);

    return color(
      vec3.sum(origin, dir.scale(t)),
      vec3.substract(target, vec3.sum(origin, dir.scale(t)))
    ).scale(0.25);

    //return new vec3({ x: N.x + 1, y: N.y + 1, z: N.z + 1 }).scale(0.5);
  }

  //second (big) sphere , ground
  t = hit_sphere(new vec3({ x: 0, y: -100.5, z: -1 }), 100, origin, dir); // big sphere
  if (t > 0) {
    target = vec3.sum(
      vec3.sum(origin, dir.scale(t / 100)),
      random_in_unit_sphere()
    );

    N = vec3.unit_vector(
      //dividing t by the to radius to scale the colors down
      vec3.substract(
        vec3.sum(origin, dir.scale(t / 100)),
        new vec3({ x: -1, y: -1, z: -1 })
      )
    );

    target = vec3.sum(target, N);

    return color(
      vec3.sum(origin, dir.scale(t / 100)),
      vec3.substract(target, vec3.sum(origin, dir.scale(t / 100)))
    ).scale(0.5);

    //return new vec3({ x: N.x + 1, y: N.y + 1, z: N.z + 1 }).scale(0.5);
  }

  let unit_direction = vec3.unit_vector(dir);
  t = 0.5 * (unit_direction.y + 1);
  return vec3.sum(
    new vec3({ x: 1, y: 1, z: 1 }).scale(1 - t),
    new vec3({ x: 0.5, y: 0.7, z: 1.0 }).scale(t)
  );
}

const width = 600;
const height = 300;
const samples = 10;
const scaleCol = 255.99;

let lower_left = new vec3({ x: -2, y: -1, z: -1 });
let horizontal = new vec3({ x: 4, y: 0, z: 0 });
let vertical = new vec3({ x: 0, y: 2, z: 0 });
let ori = new vec3({ x: 0.0, y: 0.0, z: 0.0 });

var canvas = document.getElementById("myCanvas");
var ctx2d = canvas.getContext("2d");
for (i = 0; i < width; i++) {
  for (j = 0; j < height; j++) {
    let col = new vec3({ x: 0, y: 0, z: 0 });
    for (s = 0; s < samples; s++) {
      u = (i + Math.random() / 256) / width;
      v = (j + Math.random() / 256) / height;

      v_sum = vec3.sum(horizontal.scale(u), vertical.scale(v)); //direction
      dir = vec3.sum(lower_left, v_sum); //direction
      console.log(col);
      col = vec3.sum(col, color(dir, ori));
      //col1 = vec3.sum(col,col1);
    }
    col.scale(1 / s);
    col = new vec3({
      x: Math.sqrt(col.x),
      y: Math.sqrt(col.y),
      z: Math.sqrt(col.z),
    });
    r = col.r * scaleCol;
    g = col.g * scaleCol;
    b = col.b * scaleCol;
    ctx2d.fillStyle = "rgba(" + r + "," + g + "," + b + ",1.0)";
    ctx2d.fillRect(i, height - j, 1, 1);
  }
}
