Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++)
    if (e == this[i]) return this.splice(i, 1);
}

Array.prototype.each = function(fn) {
  for (var i = 0; i < this.length; i++) fn(this[i]);
}

Array.prototype.compact = function(fn) {
  for (var i = 0; i < this.length; i++)
    if (this[i] == null) {
      this.splice(i, 1);
    }
  return this;
}

Array.prototype.add = function(e) {
  var check = true;
  for (var i = 0; i < this.length; i++)
    if (e == this[i]) check = false;
  if(check) this.push(e);
}