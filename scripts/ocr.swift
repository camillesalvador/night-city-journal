import Foundation
import AppKit
import Vision
let img=NSImage(contentsOfFile:CommandLine.arguments[1])!
var rect=CGRect(origin:.zero,size:img.size)
let cg=img.cgImage(forProposedRect:&rect,context:nil,hints:nil)!
var boxes=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:"/tmp/quest-boxes.json"))) as! [[String:Any]]
for i in boxes.indices {
 let b=boxes[i];let crop=cg.cropping(to:CGRect(x:b["x"] as! Int,y:b["y"] as! Int,width:b["w"] as! Int,height:b["h"] as! Int))!
 let req=VNRecognizeTextRequest();req.recognitionLevel = .accurate;req.usesLanguageCorrection=false
 try VNImageRequestHandler(cgImage:crop).perform([req])
 boxes[i]["lines"]=(req.results ?? []).map { ob in ["text":ob.topCandidates(1).first?.string ?? "","y":ob.boundingBox.midY,"height":ob.boundingBox.height] as [String:Any] }
}
try JSONSerialization.data(withJSONObject:boxes,options:.prettyPrinted).write(to:URL(fileURLWithPath:"/tmp/quest-ocr.json"))
print("Recognized \(boxes.count) nodes")
