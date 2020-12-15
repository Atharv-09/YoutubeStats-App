//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const https = require('https');
const { youtube } = require("googleapis/build/src/apis/youtube");
const { playablelocations } = require("googleapis/build/src/apis/playablelocations");
const mongoose = require("mongoose");
const mongodb = require("mongodb");

require('dotenv').config();
// console.log(process.env);

var MongoClient = require('mongodb').MongoClient;
const app = express();
app.set('view engine', 'ejs');

//mongo
var playListArray=[];

var url = "mongodb://localhost:27017/";

MongoClient.connect(url,{ useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("youtubeAPI");
  dbo.collection("Videos").find({}, function(err, result) {
    if (err) throw err;
		result.forEach((item, i) => {
			playListArray.push({
				videoLink:item.PlaylistLink,
				playlistID:item.PlaylistID
			})
			console.log(item.PlaylistID);
		});

    // console.log(result);
    // db.close();
  });
});
//mongoose.connect("mongodb://localhost:27017/youtubeAPI",{useNewUrlParser: true , useUnifiedTopology: true  })

// variables declared
let channelID;
let videoCount,title,channelName,lastUpdate;
let thumbnail;
let description;
let publishedAt = [];
let imageURL ;
let playlistLINK,arrayLength;
let videoTitle =[];
let videoImage = [];
let videoDescription = [];
let playlistVideoID = [];
let playlist; // playlistID
let videoDuration = [] ;



//mongo
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));



app.get("/",function(req,res){


	res.render("index",{
		totalCount:videoCount,
		description1 : description,
		imageURL1 : imageURL,
		playlistLINK1 : playlistLINK,
		title1 : title,
		channelName1 : channelName,
		lastUpdate1 : lastUpdate,
		videoTitle1 : videoTitle,
		videoDescription1 : videoDescription,
		videoDuration1 : videoDuration,
		publishedAt1 : publishedAt,
		arrayLength1 : arrayLength,
		videoImage1 : videoImage,
		playlistVideoID1 : playlistVideoID,
		playlist1 : playlist,
		playListArray1 : playListArray
		});
})




//for playlist items
app.post("/",function(req,res){

	playlist = req.body.playlistID;

	const apikey = process.env.YOUTUBE_TOKEN;
	// const apikey = "AIzaSyD5NKY4pf-OZCxCGNw5deXM1D4g3GhLx4o";
	let youtubeVideos ='';

const url1 = "https://www.googleapis.com/youtube/v3/playlists?&part=snippet,contentDetails&id="+playlist+"&key="+apikey+"&maxResults=100";
//for playlist items
const url2 = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId="+playlist+"&key="+apikey+"&maxResults=100";
	https.get(url1,function(response){
		console.log(response.statusCode);
		let youtubedata='';
		response.on("data",function(paramter){
				youtubedata =youtubedata+paramter;
				//console.log(youtubedata);
		})

		response.on("end",function(ans){
			var ans = JSON.parse(youtubedata);
			videoCount = ans.items[0].contentDetails.itemCount;
			title  = ans.items[0].snippet.title
			description = ans.items[0].snippet.description;
			playlistLINK = "https://www.youtube.com/playlist?list="+playlist;
			channelName = ans.items[0].snippet.channelTitle;
			lastUpdate = ans.items[0].snippet.publishedAt;
			imageURL = ans.items[0].snippet.thumbnails.medium.url;


			https.get(url2,function(response){
				console.log(response.statusCode);
				var youtubePlaylist = '';

				response.on("data",function(paramter){
					youtubePlaylist =youtubePlaylist+paramter;
					//console.log(youtubePlaylist);
				})

				response.on("end",function(ans2){
					var ans2 = JSON.parse(youtubePlaylist);
					arrayLength = ans2.items.length;

					if(videoTitle!=null && videoImage!=null && publishedAt!= null &&playlistVideoID!=null){
						videoTitle = [];
						videoImage = [];
						publishedAt = [];
						playlistVideoID = [];
					}

					for(var i=0;i<arrayLength;i++){

						//let url1 = "https://i.ytimg.com/vi/"+videoID+"/default.jpg";
						videoDescription.push(ans2.items[i].snippet.description);
						videoTitle.push(ans2.items[i].snippet.title);
						publishedAt.push(ans2.items[i].snippet.publishedAt);
						videoImage.push(ans2.items[i].snippet.thumbnails.default.url);
						playlistVideoID.push(ans2.items[i].snippet.resourceId.videoId)
					}

// adding videso section

for(var j=0;j<arrayLength;j++){
//	console.log(j);
const url3 = "https://www.googleapis.com/youtube/v3/videos?id="+playlistVideoID[j]+"&part=contentDetails&key="+apikey;
		https.get(url3,function(response){
		//	console.log(response.statusCode);


			response.on("data",function(paramter){
				//console.log(paramter);
				youtubeVideos = paramter;
			// console.log(youtubeVideos);
		})

			response.on("end",function(ans3){
				var ans3 = JSON.parse(youtubeVideos);
				// console.log(ans3.items[0].contentDetails.duration);
				videoDuration.push(ans3.items[0].contentDetails.duration);
				// console.log(videoDuration[0]);
				//console.log(videoDuration[0]);
			})

		});

}


// upto this
					res.redirect("/");

				});

			});
		});


	});

}).on("error", (err) => {
	console.log("Error: " + err.message);
	res.redirect("/error");
	});

app.listen(3000,(req,res) => {
	console.log("Server started at port 3000");
})
