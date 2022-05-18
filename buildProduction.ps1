node --max_old_space_size=4096 node_modules/@angular/cli/bin/ng build --prod --aot
$time = (Get-Date).ToString("dd_MM_yyyy_H_m")
$day = (Get-Date).ToString("dd_MM_yyyy")
If(!(test-path C:\Users\Kojic\Desktop\Builds\$day))
{
	New-Item -ItemType directory -Path C:\Users\Kojic\Desktop\Builds\$day
}
$dist2 = 'dist_'+ $time
Compress-Archive -Path dist\* -CompressionLevel Fastest -DestinationPath C:\Users\Kojic\Desktop\Builds\$day\$dist2
Read-Host -Prompt "Press Enter to exit"