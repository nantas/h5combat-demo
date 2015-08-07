var FXManager = require('FXManager');

var Fighter = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        isEnemy: false,
        moveForwardDuration: 0,
        moveBackwardDuration: 0,
        attackFreezeDuration: 0,
        hurtFX: 0,
        attackOffset: 0,
        idleTexture: {
            default: null,
            url: Fire.Texture
        },
        atkTexture: {
            default: null,
            url: Fire.Texture
        }
    },

    onLoad: function() {
        // engage in action
        this.canMove = true;
        // target
        this.targetFighter = null;
        // z order
        this.origZ = this.getLocalZOrder();
        // flash sprite
        this.flash = this.getChildByName('flash');
        this.flash.setOpacity(0);
        // actions
        this.actionMoveForward = null;
        this.actionMoveBackward = null;
        this.actionIdle = cc.repeatForever(cc.sequence(cc.scaleTo(1, this.getScaleX(), 0.55), cc.scaleTo(1, this.getScaleX(), 0.6))) ;
        // position
        this.targetPos = cc.p(0,0);
        this.selfPos = cc.p(this.x, this.y);
        this.actionMoveBackward = cc.moveTo(this.moveBackwardDuration, this.selfPos).easing(cc.easeCubicActionOut());
        this.idle();
    },

    idle: function() {
        this.runAction(this.actionIdle);
    },

    moveToAttack: function(target) {
        this.stopAction(this.actionIdle);
        this.canMove = false;
        this.setLocalZOrder(this.orgiZ + 0.5);
        this._assignTarget(target, this.attackOffset);
        var callback = cc.callFunc(this._playAttack, this);
        var fx = FXManager.instance.playFX(cc.p(this.x, this.y + 50), FXManager.FXType.Dust, this.getScaleX(), this.getParent());
        fx.setLocalZOrder(this.origZ - 0.5);
        this.runAction(cc.sequence(this.actionMoveForward, callback));
    },

    hurt: function(offset) {
        this.stopAction(this.actionIdle);
        this.canMove = false;
        var move1 = cc.moveBy(this.attackFreezeDuration, cc.p(offset,0)).easing(cc.easeElasticInOut(0.2));
        var move2 = cc.moveBy(this.attackFreezeDuration, cc.p(-offset,0)).easing(cc.easeElasticInOut(0.2));
        var callback = cc.callFunc(this._onHurtEnd, this);
        var seq1 = cc.sequence(move1, move2, callback);
        var flash1 = cc.fadeIn(this.attackFreezeDuration/2);
        var flash2 = cc.fadeOut(this.attackFreezeDuration/2);
        var seq2 = cc.sequence(flash1, flash2);
        FXManager.instance.playFX(cc.p(this.x+offset, this.y + 80), FXManager.FXType.Blood, this.getScaleX());
        this.runAction(seq1);
        this.flash.runAction(seq2);
    },

    _assignTarget: function(target, offset) {
        this.targetFighter = target;
        this.targetPos = cc.p(target.x + offset, target.y);
        // this.actionMoveForward = cc.moveTo(this.moveForwardDuration, this.targetPos).easing(cc.easeCubicActionOut());
        this.actionMoveForward = cc.jumpTo(this.moveForwardDuration, this.targetPos, 30, 1).easing(cc.easeCubicActionOut());
    },

    _showAtkPose: function() {
        this.setTexture(this.atkTexture);
    },

    _showIdlePose: function() {
        this.setTexture(this.idleTexture);
    },

    _playHitFreeze: function() {
        var offset = this.attackOffset;
        setTimeout(function() {
            this._moveBack();
        }.bind(this), this.attackFreezeDuration * 1000);
    },

    _playAttack: function() {
        var offset = this.attackOffset;
        this._showAtkPose();
        var callback = cc.callFunc(this._playHitFreeze, this);
        var seq = cc.sequence(cc.moveBy(this.attackFreezeDuration/4, cc.p(-offset, 0)), callback);
        FXManager.instance.playFX(cc.p(this.x - offset, 0), FXManager.FXType.Hit, this.targetFighter.getScaleX());
        this.runAction(seq);
        this.targetFighter.hurt(-offset);
    },

    _moveBack: function() {
        this._showIdlePose();
        var callback = cc.callFunc(this._onAtkEnd, this);
        this.runAction(cc.sequence(this.actionMoveBackward, callback));
    },

    _onAtkEnd: function() {
        this.setLocalZOrder(this.origZ);
        this.canMove = true;
        this.idle();
    },

    _onHurtEnd: function() {
        this.canMove = true;
        this.idle();
    }
});
