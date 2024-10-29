import { insideHitTestRectangle } from "../utility";
import { LayoutMethod, Size } from "../layout";
import { SKMouseEvent } from "../events";
import { invalidateLayout } from "../imperative-mode";

import { SKElement, SKElementProps } from "./element";

type SKContainerProps = SKElementProps & {};

export class SKContainer extends SKElement {
  private _backgroundImageSrc: string | null = null;
  private _backgroundImage: HTMLImageElement | null = null;

  constructor(elementProps: SKContainerProps = {}) {
    super(elementProps);
    this.calculateBasis();
    this.doLayout();
  }

  protected _radius = 0;
  set radius(r: number){
    this._radius = r;
  }
  get radius(){
    return this._radius;
  }

  //#region managing children

  private _children: SKElement[] = [];
  get children(): readonly SKElement[] {
    return this._children;
  }

  addChild(element: SKElement) {
    this._children.push(element);
    invalidateLayout();
  }

  removeChild(element: SKElement) {
    this._children = this._children.filter((el) => el != element);
    invalidateLayout();
  }

  clearChildren() {
    this._children = [];
    invalidateLayout();
  }

  //#endregion

  //#region event handling

  handleMouseEventCapture(me: SKMouseEvent) {
    // console.log(`${this.toString()} capture ${me.type}`);

    switch (me.type) {
      case "click":
        return this.sendEvent(
          {
            source: this,
            timeStamp: me.timeStamp,
            type: "action",
          },
          true
        );
        break;
    }
    return false;
  }

  handleMouseEvent(me: SKMouseEvent) {
    // console.log(`${this.toString()} bubble ${me.type}`);

    switch (me.type) {
      case "click":
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        });
        break;
    }
    return false;
  }

  //#endregion

  //#region background image

  set backgroundImageSrc(src: string | null) {
    this._backgroundImageSrc = src;
    if (src) {
      this._backgroundImage = new Image();
      this._backgroundImage.src = src;
      this._backgroundImage.onload = () => {
        invalidateLayout();
      };
    } else {
      this._backgroundImage = null;
    }
  }

  get backgroundImageSrc() {
    return this._backgroundImageSrc;
  }

  //#endregion

  draw(gc: CanvasRenderingContext2D) {
    gc.save();
    // set coordinate system to padding box
    gc.translate(this.margin, this.margin);

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    if (this._backgroundImage) {
      gc.globalAlpha = 0.7; // Set transparency level (0.7 for 70% transparency)
      gc.drawImage(this._backgroundImage, this.x, this.y, w, h);
      gc.globalAlpha = 1.0; // Reset to default value
    } else if (this.fill) {
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this._radius);

      // Create gradient
      const gradient = gc.createLinearGradient(this.x, this.y, this.x, this.y + h);
      gradient.addColorStop(0, "#ffffff"); // Light color at the top
      gradient.addColorStop(1, this.fill); // Original fill color at the bottom

      // Apply gradient fill
      gc.fillStyle = gradient;
      gc.fill();

      // Add shadow for bubbly effect
      gc.shadowColor = "rgba(0, 0, 0, 0.3)";
      gc.shadowBlur = 10;
      gc.shadowOffsetX = 0;
      gc.shadowOffsetY = 5;
    }

    if (this.border) {
      gc.strokeStyle = this.border;
      gc.lineWidth = 1;
      gc.stroke();
    }

    gc.restore();

    // let element draw debug if flag is set
    super.draw(gc);

    // now draw all the children
    gc.save();
    // set coordinate system to container content box
    gc.translate(this.x, this.y);
    gc.translate(this.margin, this.margin);
    gc.translate(this.padding, this.padding);
    // draw children
    this._children.forEach((el) => el.draw(gc));
    gc.restore();
  }

  //#region layout children

  protected _layoutMethod: LayoutMethod | undefined;
  set layoutMethod(lm: LayoutMethod) {
    this._layoutMethod = lm;
  }

  doLayout(width?: number, height?: number): Size {
    let recalculate = this._recalculateBasis;
    let size = super.doLayout(width, height);
    this._recalculateBasis = recalculate;
    if (this._children.length > 0) {
      this._children.forEach((el) => el.calculateBasis());
      // do initial layout of children (might change after this container layout)
      this._children.forEach((el) => el.doLayout());
      // run the layout method
      // (it returns new bounds, but we ignore it for now)
      // console.log(
      //   `${this.id} layout in ${this.box.contentBox.width}x${this.box.contentBox.height}`
      // );
      if (this._layoutMethod) {
        size = this._layoutMethod(
          this.contentBox.width,
          this.contentBox.height,
          this._children
        );
        // this.widthLayout = Math.max(size.width, this.widthBasis);
        // this.heightLayout = Math.max(size.height, this.heightBasis);

        // do final layout of children
        // (using size assigned by this container)
        this._children.forEach((el) => el.doLayout());
      }

      return size;
    } else {
      return { width: this.widthLayout, height: this.heightLayout };
    }
    // else if (this._children.length > 0) {
    //   console.warn(`${this.id} has children but no layout method`);
    // }
  }

  //#endregion

  public toString(): string {
    return (
      `SKContainer '${this.fill}'` +
      (this.id ? ` id '${this.id}' ` : " ") +
      this.boxModelToString()
    );
  }
}
