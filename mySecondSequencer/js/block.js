
var Block = function(stepNum) {
	this.width = width / numSteps;
	this.height = random(0, height);
	this.x = this.width*stepNum;
	this.color = [50,40,255];

}

Block.prototype.update = function() {
	fill(this.color);
	rect(this.x, 0, this.width, this.height);
};

Block.prototype.updateHeight = function (newHeight) {
	this.height = newHeight;
}

Block.prototype.isTouching = function (x) {
	if ( (this.x <= x) &&  (x <= (this.x + this.width) ) /* && (this.y <= y) && (y <= (this.y + this.h) ) */ ) {
		console.log('touching ' + this.x); 
		return true;
	}
	else {
		return false;
	}
}