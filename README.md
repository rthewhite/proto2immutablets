# Proto2immutableTS
Converts protobuf files to strongly typed immutable TypeScript classes.

## How to use
Install this package globally:
```
npm install -g proto2immutablets
```

Run the command:
```
p2it --proto ./test.proto --output ./
```

This will output an .ts file with TypeScript classes and enums from the proto file.


## Example:

Proto file:
```
message Circle {
	string uuid = 1;
	string name = 2;
	string description = 3;

	repeated Attribute attributes = 10;

	string createdBy = 20;
	string createdAt = 21;
	string updatedAt = 22;
	string decommissionedAt = 23;

	repeated Member members = 30;
}
```

TypeScript:
```
export class Circle {
  private _data: Map<string, any>;

  constructor(data: any = {}) {
    this._data = fromJS(data);

    if (this._data.get('attributes')) {
      const attributes = [];
      this._data.get('attributes').map(item => {
        attributes.push( new Attribute(item.toJS()));
      });
      this._data = this._data.set('attributes', List(attributes));
    }

    if (this._data.get('members')) {
      const members = [];
      this._data.get('members').map(item => {
        members.push( new Member(item.toJS()));
      });
      this._data = this._data.set('members', List(members));
    }

  }

  get uuid(): string {
    return this._data.get('uuid');
  }

  setUuid(uuid: string): Circle {
    const data = this._data.set('uuid', uuid);
    return new Circle(data.toJS());
  }

  get name(): string {
    return this._data.get('name');
  }

  setName(name: string): Circle {
    const data = this._data.set('name', name);
    return new Circle(data.toJS());
  }

  get description(): string {
    return this._data.get('description');
  }

  setDescription(description: string): Circle {
    const data = this._data.set('description', description);
    return new Circle(data.toJS());
  }

  get attributes(): List<Attribute> {
    return this._data.get('attributes');
  }

  setAttributes(attributes: List<Attribute>): Circle {
    const data = this._data.set('attributes', attributes);
    return new Circle(data.toJS());
  }

  get createdBy(): string {
    return this._data.get('createdBy');
  }

  setCreatedBy(createdBy: string): Circle {
    const data = this._data.set('createdBy', createdBy);
    return new Circle(data.toJS());
  }

  get createdAt(): string {
    return this._data.get('createdAt');
  }

  setCreatedAt(createdAt: string): Circle {
    const data = this._data.set('createdAt', createdAt);
    return new Circle(data.toJS());
  }

  get updatedAt(): string {
    return this._data.get('updatedAt');
  }

  setUpdatedAt(updatedAt: string): Circle {
    const data = this._data.set('updatedAt', updatedAt);
    return new Circle(data.toJS());
  }

  get decommissionedAt(): string {
    return this._data.get('decommissionedAt');
  }

  setDecommissionedAt(decommissionedAt: string): Circle {
    const data = this._data.set('decommissionedAt', decommissionedAt);
    return new Circle(data.toJS());
  }

  get members(): List<Member> {
    return this._data.get('members');
  }

  setMembers(members: List<Member>): Circle {
    const data = this._data.set('members', members);
    return new Circle(data.toJS());
  }

  toJS() {
    this._data.toJS();
  }
}
```