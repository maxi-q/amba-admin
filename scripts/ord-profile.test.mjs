import assert from "node:assert/strict";
import { createOrdProfilePreview } from "../src/dev/preview-ord-profile.ts";
import { validateInn } from "../src/utils/validateInn.ts";
import { isCompleteRuMobile, ruPhoneToE164 } from "../src/utils/ruPhone.ts";
import { validateOrdProfileName } from "../src/utils/ordProfileName.ts";

assert.equal(validateOrdProfileName("ООО Ромашка", "juridical"), undefined);
assert.equal(validateOrdProfileName("Ромашка", "juridical"), undefined);
assert.ok(validateOrdProfileName("  ", "juridical"));
for (const type of ["physical", "ip"]) {
  assert.equal(validateOrdProfileName("Морозов Константин Николаевич", type), undefined);
  assert.ok(validateOrdProfileName("ООО Ромашка", type));
}

const url = "/api/rooms/preview-room";
const mock = createOrdProfilePreview({ id: "preview-room" }, true);
assert.equal(mock({ url, method: "GET" }).ordPerson, null);
const data = { inn: "500100732259", name: "Морозов Константин Николаевич", phone: "+79999999999", juridicalType: "physical" };
assert.equal(validateInn(data.inn, data.juridicalType).error, null);
assert.ok(validateInn("123456789012", "physical").error);
assert.ok(validateInn(data.inn, "juridical").error);
assert.ok(isCompleteRuMobile("+7 (999) 999-99-99"));
assert.equal(ruPhoneToE164("+7 (999) 999-99-99"), data.phone);
assert.ok(!isCompleteRuMobile("+7 (999) 99"));
assert.throws(() => mock({ url: `${url}/ord-profile`, method: "POST", data: { ...data, country: "США" } }));
const created = mock({ url: `${url}/ord-profile`, method: "POST", data });
assert.equal(created.name, data.name);
assert.deepEqual(mock({ url, method: "GET" }).ordPerson, created);
assert.throws(() => mock({ url: `${url}/ord-profile`, method: "POST", data }));
for (const key of ["inn", "juridicalType", "foreign", "country", "address", "paymentNumber", "locked"]) {
  assert.throws(() => mock({ url: `${url}/ord-profile`, method: "PUT", data: { [key]: "unsupported" } }));
}
const updated = mock({ url: `${url}/ord-profile`, method: "PUT", data: { name: "Морозов Константин Александрович" } });
assert.equal(updated.name, "Морозов Константин Александрович");
assert.equal(updated.phone, data.phone);
assert.equal(updated.inn, data.inn);
assert.deepEqual(mock({ url, method: "GET" }).ordPerson, updated);
assert.equal(mock({ url: "/api/unrelated", method: "GET" }), undefined);
console.log("ORD profile: create/update, immutable fields, demo-only fields and existing validation passed.");
