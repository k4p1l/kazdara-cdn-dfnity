import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import DateTime "mo:datetime/DateTime";  
import Iter "mo:base/Iter";

actor{
    private type FileId = Text;

    type HeaderField = (Text, Text);


    private type FileInfo = {
      name : Text;
      owner : Principal;
      content : Blob;
      uploadDate: Time.Time;
    };

    private let fileStore = HashMap.HashMap<FileId, FileInfo>(20, Text.equal, Text.hash);

    public shared(msg) func uploadFile(name : Text, content : Blob) : async FileId {
    let id = Nat.toText(fileStore.size());
    let caller = msg.caller;
    
    let uploadDate = Time.now();
    fileStore.put(id, { name = name; content = content; owner = caller; 
    uploadDate = uploadDate; });
    return id;
    };

    public query func getFileInfo(id : FileId) : async ?FileInfo {
        fileStore.get(id)
    };

    public shared query (msg) func listFiles() : async [(FileId, Text, Time.Time)] {
    var result : [(FileId, Text, Time.Time)] = [];
    let caller = msg.caller;
    for (entry in fileStore.entries()) {
      let fileId = entry.0;
      let fileName = entry.1.name;
      if (entry.1.owner == caller) {
        result := Array.append(result, [(fileId, fileName, entry.1.uploadDate)]);
        };
      };
    return result;
    };

    public query func getFile(id : FileId) : async ?Blob {
        switch (fileStore.get(id)) {
            case null { null };
            case (?fileInfo) { ?fileInfo.content };
        }
    };

    public shared(msg) func deleteFile(id : FileId) : async Bool {
        let caller = msg.caller;
        
        if (fileStore.get(id) == null) {
            return false;
        };

         let fileInfo = fileStore.get(id);
        switch (fileInfo) {
          case (?file) {
            if (file.owner == caller) {
                ignore fileStore.remove(id);
                return true;
            } else {
                return false;
            }
        };
        case null { return false };
        }
    };
    
 // Generate a public CDN link for a file
    public query func generateCdnLink(id : FileId) : async ?Text {
        let baseUrl = "https://natn5-syaaa-aaaan-qmuxa-cai.icp0.io/";
        if (fileStore.get(id) != null) {
            return ?(baseUrl # "cdn/" # id);
        };
        return null;
    };    

    public query func searchFiles(searchQuery: Text) : async [(FileId, Text, Time.Time)] {
        var result : [(FileId, Text, Time.Time)] = [];
        let lowercaseQuery = Text.toLowercase(searchQuery);

        for (entry in fileStore.entries()) {
            let fileId = entry.0;
            let fileName = Text.toLowercase(entry.1.name);

            if (Text.contains(fileName, #text lowercaseQuery)) {
                result := Array.append(result, [(fileId, entry.1.name, entry.1.uploadDate)]);
            }
        };

        return result;
};

}
