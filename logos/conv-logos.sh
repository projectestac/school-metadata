#!/bin/bash

# Resizes all the images located in "./raw" to a maximum height of 150px
# and stores the resulting image in PNG format into "./conv"
#
# Note: Package "imagemagick" (providing "convert") should be already installed!

src="raw"
dest="conv"

mkdir -p $dest
for fullpath in $src/*
do
  filename=$(basename -- "$fullpath")
  destfilename="$dest/${filename%.*}.png"
  extension=${filename##*\.}
  echo "Resizing $fullpath to $destfilename"
  if [ "$extension" == "gif" ]
  then
    # Take only the first frame in animated gifs
    convert $fullpath -resize x150 -delete 1--1 $destfilename
  else
    convert $fullpath -resize x150 $destfilename
  fi
done
